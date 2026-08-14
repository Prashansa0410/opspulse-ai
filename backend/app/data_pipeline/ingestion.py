"""Raw data ingestion engine for OpsPulse AI."""
import logging
from dataclasses import asdict
from typing import Any
import pandas as pd
from backend.app.db.session import db_manager
from backend.app.config import settings
from backend.app.data_pipeline.generator import (
    OperationalDataGenerator,
    Region, Warehouse, Carrier, Product, Customer, Order, OrderItem, Shipment, DeliveryEvent, Payment, SupportTicket
)

logger = logging.getLogger("opspulse.ingestion")


class IngestionEngine:
    """Loads generated and streamed records into DuckDB and raw parquet storage."""

    def __init__(self, db=db_manager):
        self.db = db

    def populate_seed_data(self, volume: str = "small", seed: int = 42) -> dict[str, int]:
        """Populate database with deterministic initial data."""
        self.db.init_schema()
        
        target_orders = {
            "small": 3000,
            "medium": 25000,
            "large": 150000
        }.get(volume, 3000)

        logger.info(f"Generating operational dataset: volume={volume}, orders={target_orders}, seed={seed}")
        gen = OperationalDataGenerator(seed=seed, days=30)
        
        # 1. Static dimensions
        customers = gen.generate_customers(count=max(600, target_orders // 3))
        inventory = gen.generate_inventory()
        
        # 2. Transactions & Lifecycle
        orders, order_items, shipments, delivery_events, payments, tickets = gen.generate_orders_and_lifecycle(
            orders_target=target_orders
        )

        conn = self.db.get_connection()

        # Clear existing transactional records
        conn.execute("DELETE FROM support_tickets;")
        conn.execute("DELETE FROM payments;")
        conn.execute("DELETE FROM delivery_events;")
        conn.execute("DELETE FROM shipments;")
        conn.execute("DELETE FROM order_items;")
        conn.execute("DELETE FROM orders;")
        conn.execute("DELETE FROM inventory;")
        conn.execute("DELETE FROM customers;")
        conn.execute("DELETE FROM products;")
        conn.execute("DELETE FROM carriers;")
        conn.execute("DELETE FROM warehouses;")
        conn.execute("DELETE FROM regions;")

        # Convert to DataFrames and load via DuckDB high-speed registration
        df_regions = pd.DataFrame([asdict(r) for r in gen.regions])
        df_warehouses = pd.DataFrame([asdict(w) for w in gen.warehouses])
        df_carriers = pd.DataFrame([asdict(c) for c in gen.carriers])
        df_products = pd.DataFrame([asdict(p) for p in gen.products])
        df_customers = pd.DataFrame([asdict(c) for c in customers])
        df_inventory = pd.DataFrame(inventory)
        df_orders = pd.DataFrame([asdict(o) for o in orders])
        df_order_items = pd.DataFrame([asdict(oi) for oi in order_items])
        df_shipments = pd.DataFrame([asdict(s) for s in shipments])
        df_events = pd.DataFrame([asdict(e) for e in delivery_events])
        df_payments = pd.DataFrame([asdict(p) for p in payments])
        df_tickets = pd.DataFrame([asdict(t) for t in tickets])

        conn.register("tmp_regions", df_regions)
        conn.execute("INSERT INTO regions SELECT * FROM tmp_regions;")
        conn.unregister("tmp_regions")

        conn.register("tmp_warehouses", df_warehouses)
        conn.execute("INSERT INTO warehouses SELECT * FROM tmp_warehouses;")
        conn.unregister("tmp_warehouses")

        conn.register("tmp_carriers", df_carriers)
        conn.execute("INSERT INTO carriers SELECT * FROM tmp_carriers;")
        conn.unregister("tmp_carriers")

        conn.register("tmp_products", df_products)
        conn.execute("INSERT INTO products SELECT * FROM tmp_products;")
        conn.unregister("tmp_products")

        conn.register("tmp_customers", df_customers)
        conn.execute("INSERT INTO customers SELECT * FROM tmp_customers;")
        conn.unregister("tmp_customers")

        conn.register("tmp_inventory", df_inventory)
        conn.execute("INSERT INTO inventory SELECT * FROM tmp_inventory;")
        conn.unregister("tmp_inventory")

        conn.register("tmp_orders", df_orders)
        conn.execute("INSERT INTO orders SELECT * FROM tmp_orders;")
        conn.unregister("tmp_orders")

        conn.register("tmp_order_items", df_order_items)
        conn.execute("INSERT INTO order_items SELECT * FROM tmp_order_items;")
        conn.unregister("tmp_order_items")

        conn.register("tmp_shipments", df_shipments)
        conn.execute("INSERT INTO shipments SELECT * FROM tmp_shipments;")
        conn.unregister("tmp_shipments")

        conn.register("tmp_events", df_events)
        conn.execute("INSERT INTO delivery_events SELECT * FROM tmp_events;")
        conn.unregister("tmp_events")

        conn.register("tmp_payments", df_payments)
        conn.execute("INSERT INTO payments SELECT * FROM tmp_payments;")
        conn.unregister("tmp_payments")

        conn.register("tmp_tickets", df_tickets)
        conn.execute("INSERT INTO support_tickets SELECT * FROM tmp_tickets;")
        conn.unregister("tmp_tickets")

        # Save Parquet snapshot for raw lakehouse integration via DuckDB native writer
        try:
            conn.execute(f"COPY orders TO '{settings.PARQUET_DIR / 'orders.parquet'}' (FORMAT PARQUET);")
            conn.execute(f"COPY delivery_events TO '{settings.PARQUET_DIR / 'delivery_events.parquet'}' (FORMAT PARQUET);")
        except Exception as e:
            logger.warning(f"Parquet snapshot warning: {e}")

        counts = {
            "regions": len(df_regions),
            "warehouses": len(df_warehouses),
            "carriers": len(df_carriers),
            "products": len(df_products),
            "customers": len(df_customers),
            "inventory": len(df_inventory),
            "orders": len(df_orders),
            "order_items": len(df_order_items),
            "shipments": len(df_shipments),
            "delivery_events": len(df_events),
            "payments": len(df_payments),
            "support_tickets": len(df_tickets)
        }

        logger.info(f"Seed data ingested successfully: {counts}")
        return counts


ingestion_engine = IngestionEngine()
