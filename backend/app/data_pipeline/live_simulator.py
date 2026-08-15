"""Lightweight real-time operational event simulator for OpsPulse AI."""
import datetime as dt
import logging
import random
import threading
import uuid

from backend.app.db.session import db_manager
from backend.app.data_pipeline.dbt_transforms import transformation_engine
from backend.app.ml.anomaly_detector import anomaly_detector

logger = logging.getLogger("opspulse.live_simulator")

_lock = threading.Lock()


class LiveOperationalSimulator:
    """Append a small batch of fresh operational events and refresh analytical marts."""

    def __init__(self, db=db_manager):
        self.db = db
        self.rng = random.Random()

    def tick(self, orders_per_tick: int = 5) -> dict:
        """Generate a small batch of current-day events.

        This is deliberately bounded so the free Render service remains cheap.
        The simulator reuses existing dimension data and only appends transactional
        records; it does not rebuild the 3,000-order seed dataset.
        """
        if not _lock.acquire(blocking=False):
            return {"status": "busy", "orders_created": 0}

        try:
            conn = self.db.get_connection()
            now = dt.datetime.now()

            warehouses = conn.execute(
                "SELECT warehouse_id, region_id, code FROM warehouses"
            ).fetchall()
            carriers = conn.execute(
                "SELECT carrier_id, base_sla_hours FROM carriers"
            ).fetchall()
            customers = conn.execute(
                "SELECT customer_id, region_id FROM customers LIMIT 500"
            ).fetchall()
            products = conn.execute(
                "SELECT product_id, price, weight_kg FROM products"
            ).fetchall()

            if not warehouses or not carriers or not customers or not products:
                return {"status": "not_ready", "orders_created": 0}

            created = 0
            breached = 0
            failed_payments = 0

            for _ in range(max(1, min(orders_per_tick, 25))):
                customer_id, customer_region = self.rng.choice(customers)
                warehouse_id, warehouse_region, warehouse_code = self.rng.choice(warehouses)
                carrier_id, sla_hours = self.rng.choice(carriers)
                product_id, price, weight = self.rng.choice(products)

                order_id = f"LIVE_{uuid.uuid4().hex[:20].upper()}"
                order_number = f"LIVE-{now.strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6].upper()}"
                shipment_id = f"SHIP_{uuid.uuid4().hex[:20].upper()}"
                payment_id = f"PAY_{uuid.uuid4().hex[:20].upper()}"
                item_id = f"ITEM_{uuid.uuid4().hex[:20].upper()}"
                event_id = f"EVT_{uuid.uuid4().hex[:20].upper()}"

                quantity = self.rng.choice([1, 1, 1, 2])
                amount = round(float(price) * quantity, 2)
                cross_zone = customer_region != warehouse_region
                incident_pressure = warehouse_code == "BLR-01" and self.rng.random() < 0.30
                is_breached = incident_pressure or self.rng.random() < 0.08
                status = "DELIVERED" if self.rng.random() < 0.45 else "IN_TRANSIT"
                if is_breached:
                    breached += 1

                promised = now + dt.timedelta(hours=max(12, int(sla_hours)))
                actual = now + dt.timedelta(hours=self.rng.uniform(1, 10)) if status == "DELIVERED" else None
                breach_reason = "Warehouse Congestion" if incident_pressure else ("Carrier Delay" if is_breached else None)

                conn.execute(
                    """INSERT INTO orders (
                        order_id, order_number, customer_id, warehouse_id, carrier_id,
                        region_id, order_status, order_date, promised_delivery_date,
                        actual_delivery_date, total_amount, items_count, is_sla_breached,
                        sla_breach_reason, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (order_id, order_number, customer_id, warehouse_id, carrier_id,
                     customer_region, status, now, promised, actual, amount, quantity,
                     is_breached, breach_reason, now),
                )

                conn.execute(
                    "INSERT INTO order_items (item_id, order_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?, ?)",
                    (item_id, order_id, product_id, quantity, price, amount),
                )

                packed_at = now + dt.timedelta(minutes=self.rng.randint(10, 180))
                pickup_at = packed_at + dt.timedelta(minutes=self.rng.randint(15, 360))
                delivered_at = actual if status == "DELIVERED" else None
                shipment_status = "DELIVERED" if delivered_at else "IN_TRANSIT"
                tracking = f"TRK{uuid.uuid4().hex[:16].upper()}"

                conn.execute(
                    """INSERT INTO shipments (
                        shipment_id, order_id, warehouse_id, carrier_id, tracking_number,
                        origin_hub, destination_hub, weight_kg, status, created_at,
                        packed_at, carrier_picked_up_at, out_for_delivery_at, delivered_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (shipment_id, order_id, warehouse_id, carrier_id, tracking,
                     warehouse_code, "LIVE-DEST", float(weight) * quantity, shipment_status,
                     now, packed_at, pickup_at, delivered_at if delivered_at else None, delivered_at),
                )

                event_type = "DELIVERED" if delivered_at else "IN_TRANSIT"
                conn.execute(
                    "INSERT INTO delivery_events (event_id, shipment_id, order_id, event_type, timestamp, location, note) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    (event_id, shipment_id, order_id, event_type, now, warehouse_code, "Live simulated operational event"),
                )

                payment_failed = self.rng.random() < (0.18 if self.rng.random() < 0.15 else 0.03)
                payment_status = "FAILED" if payment_failed else "SUCCESS"
                if payment_failed:
                    failed_payments += 1

                conn.execute(
                    """INSERT INTO payments (
                        payment_id, order_id, customer_id, payment_method, provider,
                        amount, status, failure_reason, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (payment_id, order_id, customer_id,
                     self.rng.choice(["UPI", "CREDIT_CARD", "NET_BANKING"]),
                     self.rng.choice(["Razorpay", "PayFast", "StripeDirect"]),
                     amount, payment_status,
                     "Gateway timeout" if payment_failed else None, now),
                )
                created += 1

            # Rebuild the small analytical marts from the now-current operational data.
            transformation_engine.run_all_transforms()
            anomaly_detector.detect_all_anomalies()

            return {
                "status": "success",
                "orders_created": created,
                "sla_breaches_created": breached,
                "payment_failures_created": failed_payments,
                "generated_at": now.isoformat(),
            }
        finally:
            _lock.release()


live_simulator = LiveOperationalSimulator()
