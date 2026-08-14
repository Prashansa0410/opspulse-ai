"""Deterministic, Causal Operational Data Generator for OpsPulse AI."""
import random
import uuid
import datetime
from typing import Generator, Any
from dataclasses import dataclass, asdict

# Seedable random number generator
DEFAULT_SEED = 42


@dataclass
class Region:
    region_id: str
    name: str
    code: str
    state: str
    metro_type: str
    risk_level: str


@dataclass
class Warehouse:
    warehouse_id: str
    name: str
    code: str
    city: str
    state: str
    region_id: str
    capacity_orders_per_day: int
    current_utilization: float
    status: str
    manager_name: str


@dataclass
class Carrier:
    carrier_id: str
    name: str
    service_type: str
    base_sla_hours: int
    cost_per_kg: float
    on_time_baseline_rate: float
    status: str


@dataclass
class Product:
    product_id: str
    sku: str
    title: str
    category: str
    price: float
    weight_kg: float
    is_fragile: bool


@dataclass
class Customer:
    customer_id: str
    name: str
    email: str
    tier: str
    segment: str
    city: str
    state: str
    region_id: str
    pincode: str
    signup_date: str


@dataclass
class Order:
    order_id: str
    order_number: str
    customer_id: str
    warehouse_id: str
    carrier_id: str
    region_id: str
    order_status: str
    order_date: str
    promised_delivery_date: str
    actual_delivery_date: str | None
    total_amount: float
    items_count: int
    is_sla_breached: bool
    sla_breach_reason: str | None
    created_at: str


@dataclass
class OrderItem:
    item_id: str
    order_id: str
    product_id: str
    quantity: int
    unit_price: float
    total_price: float


@dataclass
class Shipment:
    shipment_id: str
    order_id: str
    warehouse_id: str
    carrier_id: str
    tracking_number: str
    origin_hub: str
    destination_hub: str
    weight_kg: float
    status: str
    created_at: str
    packed_at: str | None
    carrier_picked_up_at: str | None
    out_for_delivery_at: str | None
    delivered_at: str | None


@dataclass
class DeliveryEvent:
    event_id: str
    shipment_id: str
    order_id: str
    event_type: str
    timestamp: str
    location: str
    note: str | None


@dataclass
class Payment:
    payment_id: str
    order_id: str
    customer_id: str
    payment_method: str
    provider: str
    amount: float
    status: str
    failure_reason: str | None
    created_at: str


@dataclass
class SupportTicket:
    ticket_id: str
    order_id: str | None
    customer_id: str
    category: str
    priority: str
    status: str
    subject: str
    created_at: str
    resolved_at: str | None
    csat_score: int | None


class OperationalDataGenerator:
    """Generates interconnected operational entities with causal incidents."""

    def __init__(self, seed: int = DEFAULT_SEED, start_date: datetime.datetime | None = None, days: int = 30):
        self.seed = seed
        self.rng = random.Random(seed)
        self.days = days
        self.start_date = start_date or (datetime.datetime.now() - datetime.timedelta(days=days))
        
        self.regions: list[Region] = []
        self.warehouses: list[Warehouse] = []
        self.carriers: list[Carrier] = []
        self.products: list[Product] = []
        self.customers: list[Customer] = []
        
        self._init_static_data()

    def _init_static_data(self) -> None:
        self.regions = [
            Region("REG_BLR", "South - Bangalore Metropolis", "BLR", "Karnataka", "Tier-1", "LOW"),
            Region("REG_DEL", "North - Delhi NCR", "DEL", "Delhi", "Tier-1", "MEDIUM"),
            Region("REG_BOM", "West - Mumbai Gateway", "BOM", "Maharashtra", "Tier-1", "LOW"),
            Region("REG_HYD", "South - Hyderabad Central", "HYD", "Telangana", "Tier-1", "LOW"),
            Region("REG_CCU", "East - Kolkata Terminal", "CCU", "West Bengal", "Tier-2", "HIGH"),
            Region("REG_MAA", "South - Chennai Coast", "MAA", "Tamil Nadu", "Tier-1", "LOW"),
        ]

        self.warehouses = [
            Warehouse("WH_BLR_01", "Bangalore Mega Fulfillment Center", "BLR-01", "Bangalore", "Karnataka", "REG_BLR", 4000, 0.68, "ACTIVE", "Rajesh Sharma"),
            Warehouse("WH_BLR_02", "Bangalore South Satellite Hub", "BLR-02", "Bangalore", "Karnataka", "REG_BLR", 2500, 0.55, "ACTIVE", "Ananya Rao"),
            Warehouse("WH_DEL_01", "Delhi North Mega Logistics", "DEL-01", "Gurgaon", "Haryana", "REG_DEL", 3800, 0.72, "ACTIVE", "Vikram Singh"),
            Warehouse("WH_BOM_01", "Mumbai West Gateway FC", "BOM-01", "Bhiwandi", "Maharashtra", "REG_BOM", 3500, 0.70, "ACTIVE", "Sunil Deshmukh"),
            Warehouse("WH_HYD_01", "Hyderabad Central Hub", "HYD-01", "Hyderabad", "Telangana", "REG_HYD", 2200, 0.60, "ACTIVE", "Kavita Reddy"),
            Warehouse("WH_CCU_01", "Kolkata East Terminal FC", "CCU-01", "Kolkata", "West Bengal", "REG_CCU", 1800, 0.62, "ACTIVE", "Debabrata Roy"),
        ]

        self.carriers = [
            Carrier("CAR_SWIFT", "SwiftExpress Direct", "Express Air/Surface", 36, 45.0, 0.95, "ACTIVE"),
            Carrier("CAR_BLUE", "BlueDart Prime", "Priority Express", 24, 68.0, 0.97, "ACTIVE"),
            Carrier("CAR_DELHIVERY", "Delhivery Surface Max", "Standard Ground", 48, 34.0, 0.93, "ACTIVE"),
            Carrier("CAR_SHADOW", "Shadowfax HyperLocal", "Same-Day / Next-Day", 18, 42.0, 0.94, "ACTIVE"),
            Carrier("CAR_EKART", "Ekart Logistics Hub", "Standard Surface", 36, 40.0, 0.96, "ACTIVE"),
        ]

        categories = [
            ("Electronics", ["Wireless Noise-Canceling Headphones", "Smart Fitness Watch Ultra", "Fast USB-C 65W GaN Charger", "Mechanical Gaming Keyboard RGB", "4K Web Camera Pro", "Portable Bluetooth Speaker"]),
            ("Apparel", ["Men's Organic Cotton Crew Tee", "Women's High-Rise Yoga Leggings", "Lightweight Water-Repellent Windbreaker", "Tailored Formal Oxford Shirt", "Performance Running Socks 3-Pack"]),
            ("Home & Kitchen", ["Ergonomic Memory Foam Pillow", "Stainless Steel Insulated Tumbler 1L", "Cold Brew Coffee Maker Glass", "Digital Kitchen Scale Precision", "Smart LED Desk Lamp"]),
            ("Personal Care", ["Hydrating Hyaluronic Facial Serum", "Bamboo Charcoal Toothbrush 4-Pack", "Organic Argan Oil Hair Treatment", "Mineral Sunscreen SPF 50+"]),
            ("Books & Stationery", ["Dot Grid Hardcover Journal", "Executive Brass Fountain Pen", "System Architecture Mastery Guide", "High Performance Python Handbook"]),
        ]

        p_idx = 1
        for cat, items in categories:
            for title in items:
                price = round(self.rng.uniform(299, 5999), 2)
                weight = round(self.rng.uniform(0.15, 3.5), 2)
                is_fragile = "Glass" in title or "Screen" in title or "Camera" in title or "Watch" in title
                sku = f"SKU-{cat[:3].upper()}-{p_idx:04d}"
                self.products.append(Product(f"PROD_{p_idx:04d}", sku, title, cat, price, weight, is_fragile))
                p_idx += 1

    def generate_customers(self, count: int = 1000) -> list[Customer]:
        first_names = ["Aarav", "Aditi", "Rohan", "Pooja", "Arjun", "Neha", "Rahul", "Priya", "Sanjay", "Deepa", "Vikram", "Sneha", "Karan", "Meera", "Varun", "Ritu", "Amit", "Shreya", "Nikhil", "Divya"]
        last_names = ["Sharma", "Verma", "Patel", "Reddy", "Nair", "Gupta", "Iyer", "Mehta", "Singh", "Das", "Rao", "Joshi", "Bose", "Kulkarni", "Chopra", "Mishra", "Banerjee", "Kapoor", "Agarwal", "Bhat"]
        
        customers = []
        for i in range(1, count + 1):
            fn = self.rng.choice(first_names)
            ln = self.rng.choice(last_names)
            name = f"{fn} {ln}"
            email = f"{fn.lower()}.{ln.lower()}{self.rng.randint(10, 999)}@example.com"
            reg = self.rng.choice(self.regions)
            tier = self.rng.choices(["STANDARD", "PRIME", "VIP_ENTERPRISE"], weights=[0.70, 0.25, 0.05])[0]
            segment = self.rng.choices(["Direct Consumer", "Small Business", "Enterprise Partner"], weights=[0.80, 0.15, 0.05])[0]
            pincode = f"{self.rng.randint(110001, 700099)}"
            signup = (self.start_date - datetime.timedelta(days=self.rng.randint(30, 730))).strftime("%Y-%m-%d %H:%M:%S")
            
            c = Customer(f"CUST_{i:06d}", name, email, tier, segment, reg.name.split(" - ")[-1], reg.state, reg.region_id, pincode, signup)
            customers.append(c)
        self.customers = customers
        return customers

    def generate_inventory(self) -> list[dict[str, Any]]:
        inventory = []
        for wh in self.warehouses:
            for p in self.products:
                stock = self.rng.randint(50, 1200)
                reserved = int(stock * self.rng.uniform(0.05, 0.25))
                inventory.append({
                    "inventory_id": f"INV_{wh.code}_{p.sku}",
                    "warehouse_id": wh.warehouse_id,
                    "product_id": p.product_id,
                    "stock_on_hand": stock,
                    "reserved_stock": reserved,
                    "reorder_point": 30,
                    "updated_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                })
        return inventory

    def generate_orders_and_lifecycle(
        self,
        orders_target: int = 5000
    ) -> tuple[list[Order], list[OrderItem], list[Shipment], list[DeliveryEvent], list[Payment], list[SupportTicket]]:
        if not self.customers:
            self.generate_customers(count=max(500, orders_target // 3))

        orders: list[Order] = []
        order_items: list[OrderItem] = []
        shipments: list[Shipment] = []
        delivery_events: list[DeliveryEvent] = []
        payments: list[Payment] = []
        support_tickets: list[SupportTicket] = []

        payment_methods = ["UPI", "CREDIT_CARD", "NET_BANKING", "DEBIT_CARD", "EMI"]
        payment_providers = ["Razorpay", "PayFast", "StripeDirect", "HDFC_Gateway", "ICICI_PG"]

        # Calculate orders per day
        daily_base = orders_target / self.days
        order_seq = 1
        item_seq = 1
        event_seq = 1
        ticket_seq = 1

        for day_offset in range(self.days):
            current_day = self.start_date + datetime.timedelta(days=day_offset)
            day_num = day_offset + 1
            is_weekend = current_day.weekday() in [5, 6]

            # -------------------------------------------------------------
            # Causal Incident Scenarios:
            # Day 22 to 26: Flash Sale Surge + Warehouse Congestion + Carrier Bottleneck
            # Day 23 to 24: Payment Provider Incident (PayFast)
            # -------------------------------------------------------------
            is_incident_period = (22 <= day_num <= 26)
            is_payfast_incident = (23 <= day_num <= 24)

            # Volume multiplier
            if is_incident_period:
                volume_mult = 2.4 if is_weekend else 1.8
            elif is_weekend:
                volume_mult = 1.3
            else:
                volume_mult = 1.0

            daily_orders_count = int(daily_base * volume_mult * self.rng.uniform(0.92, 1.08))

            for _ in range(daily_orders_count):
                cust = self.rng.choice(self.customers)
                
                # Order creation timestamp
                hour = self.rng.choices(list(range(24)), weights=[1,1,1,1,2,3,5,8,10,12,14,15,14,13,12,11,10,12,14,15,12,8,5,2])[0]
                minute = self.rng.randint(0, 59)
                second = self.rng.randint(0, 59)
                order_time = current_day.replace(hour=hour, minute=minute, second=second)
                order_time_str = order_time.strftime("%Y-%m-%d %H:%M:%S")

                # Warehouse assignment
                if is_incident_period and self.rng.random() < 0.65:
                    # BLR-01 heavily overloaded
                    wh = next(w for w in self.warehouses if w.warehouse_id == "WH_BLR_01")
                else:
                    wh = self.rng.choice(self.warehouses)

                # Carrier assignment
                if is_incident_period and wh.warehouse_id == "WH_BLR_01" and self.rng.random() < 0.55:
                    carrier = next(c for c in self.carriers if c.carrier_id == "CAR_SWIFT")
                else:
                    carrier = self.rng.choice(self.carriers)

                # Items
                num_items = self.rng.choices([1, 2, 3, 4], weights=[0.55, 0.30, 0.10, 0.05])[0]
                chosen_prods = self.rng.sample(self.products, num_items)
                total_amount = 0.0
                total_weight = 0.0

                order_id = f"ORD_{order_seq:08d}"
                order_number = f"PO-{order_time.strftime('%Y%m')}-{order_seq:06d}"

                for p in chosen_prods:
                    qty = self.rng.randint(1, 2)
                    price = p.price
                    tot_p = price * qty
                    total_amount += tot_p
                    total_weight += p.weight_kg * qty

                    oi = OrderItem(
                        item_id=f"ITEM_{item_seq:09d}",
                        order_id=order_id,
                        product_id=p.product_id,
                        quantity=qty,
                        unit_price=price,
                        total_price=tot_p
                    )
                    order_items.append(oi)
                    item_seq += 1

                total_amount = round(total_amount, 2)
                total_weight = round(total_weight, 2)

                # Payment Generation
                pay_method = self.rng.choice(payment_methods)
                if is_payfast_incident and self.rng.random() < 0.45:
                    pay_provider = "PayFast"
                else:
                    pay_provider = self.rng.choice(payment_providers)

                # Causal Payment Failure Spike
                if is_payfast_incident and pay_provider == "PayFast":
                    is_pay_fail = self.rng.random() < 0.28  # 28% failure for PayFast during incident
                else:
                    is_pay_fail = self.rng.random() < 0.018  # normal 1.8%

                pay_id = f"PAY_{order_seq:08d}"
                if is_pay_fail:
                    pay_status = "FAILED"
                    fail_reason = "PAYMENT_GATEWAY_TIMEOUT_504" if pay_provider == "PayFast" else "INSUFFICIENT_FUNDS_OR_DECLINED"
                    payments.append(Payment(pay_id, order_id, cust.customer_id, pay_method, pay_provider, total_amount, pay_status, fail_reason, order_time_str))
                    
                    # Canceled / Failed Order
                    orders.append(Order(
                        order_id=order_id,
                        order_number=order_number,
                        customer_id=cust.customer_id,
                        warehouse_id=wh.warehouse_id,
                        carrier_id=carrier.carrier_id,
                        region_id=cust.region_id,
                        order_status="PAYMENT_FAILED",
                        order_date=order_time_str,
                        promised_delivery_date=(order_time + datetime.timedelta(hours=carrier.base_sla_hours)).strftime("%Y-%m-%d %H:%M:%S"),
                        actual_delivery_date=None,
                        total_amount=total_amount,
                        items_count=num_items,
                        is_sla_breached=False,
                        sla_breach_reason="PAYMENT_FAILED",
                        created_at=order_time_str
                    ))
                    
                    # Support ticket for payment issue
                    if self.rng.random() < 0.35:
                        support_tickets.append(SupportTicket(
                            ticket_id=f"TCK_{ticket_seq:07d}",
                            order_id=order_id,
                            customer_id=cust.customer_id,
                            category="PAYMENT_ISSUE",
                            priority="HIGH",
                            status="RESOLVED" if day_num < self.days - 2 else "OPEN",
                            subject=f"Payment deducted but order failed via {pay_provider}",
                            created_at=order_time_str,
                            resolved_at=(order_time + datetime.timedelta(hours=self.rng.randint(2, 24))).strftime("%Y-%m-%d %H:%M:%S") if day_num < self.days - 2 else None,
                            csat_score=self.rng.randint(1, 3) if day_num < self.days - 2 else None
                        ))
                        ticket_seq += 1

                    order_seq += 1
                    continue

                # Successful Payment
                payments.append(Payment(pay_id, order_id, cust.customer_id, pay_method, pay_provider, total_amount, "SUCCESS", None, order_time_str))

                # Lifecycle Timestamps & Causal Delays
                # 1. Packing / Warehouse Delay
                if is_incident_period and wh.warehouse_id == "WH_BLR_01":
                    # Severe warehouse congestion: 6 to 14 hours packing time
                    pack_delay_hrs = self.rng.uniform(6.5, 14.0)
                    wh_breach = True
                else:
                    # Normal packing: 1 to 3.5 hours
                    pack_delay_hrs = self.rng.uniform(0.8, 3.2)
                    wh_breach = False

                packed_time = order_time + datetime.timedelta(hours=pack_delay_hrs)

                # 2. Carrier Pickup Delay
                if is_incident_period and wh.warehouse_id == "WH_BLR_01" and carrier.carrier_id == "CAR_SWIFT":
                    # Severe carrier dock backlog: 6 to 16 hours pickup delay
                    carrier_pickup_delay_hrs = self.rng.uniform(6.0, 15.5)
                    carrier_breach = True
                else:
                    carrier_pickup_delay_hrs = self.rng.uniform(0.5, 2.5)
                    carrier_breach = False

                pickup_time = packed_time + datetime.timedelta(hours=carrier_pickup_delay_hrs)

                # 3. Transit & Out for Delivery
                # Inter-region vs Intra-region transit
                same_region = (wh.region_id == cust.region_id)
                base_transit_hrs = self.rng.uniform(8.0, 18.0) if same_region else self.rng.uniform(22.0, 44.0)
                
                # Cross-zone route congestion during incident
                if is_incident_period and not same_region:
                    base_transit_hrs += self.rng.uniform(8.0, 20.0)

                out_for_delivery_time = pickup_time + datetime.timedelta(hours=base_transit_hrs)
                
                # 4. Final Delivery
                last_mile_hrs = self.rng.uniform(1.5, 5.0)
                delivered_time = out_for_delivery_time + datetime.timedelta(hours=last_mile_hrs)

                # Total fulfillment hours vs promised SLA
                promised_sla_hrs = carrier.base_sla_hours + (0 if same_region else 24)
                promised_time = order_time + datetime.timedelta(hours=promised_sla_hrs)
                
                total_duration_hrs = (delivered_time - order_time).total_seconds() / 3600.0
                is_sla_breached = (delivered_time > promised_time)

                # Attribution of root cause
                sla_breach_reason = None
                if is_sla_breached:
                    if pack_delay_hrs > 6.0:
                        sla_breach_reason = "WAREHOUSE_PROCESSING_BOTTLENECK"
                    elif carrier_pickup_delay_hrs > 5.0:
                        sla_breach_reason = "CARRIER_PICKUP_DOCK_BACKLOG"
                    elif base_transit_hrs > (36.0 if same_region else 48.0):
                        sla_breach_reason = "TRANSIT_ROUTE_CHOKEPOINT"
                    else:
                        sla_breach_reason = "LAST_MILE_DELIVERY_DELAY"

                # If order is very recent (last 1-2 days), leave some in IN_TRANSIT or PACKED
                hours_ago = (datetime.datetime.now() - order_time).total_seconds() / 3600.0
                if hours_ago < 6:
                    order_status = "ORDER_PACKED"
                    act_deliv = None
                    ship_deliv = None
                    ship_ofd = None
                elif hours_ago < 24:
                    order_status = "IN_TRANSIT"
                    act_deliv = None
                    ship_deliv = None
                    ship_ofd = None
                elif hours_ago < 36 and self.rng.random() < 0.3:
                    order_status = "OUT_FOR_DELIVERY"
                    act_deliv = None
                    ship_deliv = None
                    ship_ofd = out_for_delivery_time.strftime("%Y-%m-%d %H:%M:%S")
                else:
                    order_status = "DELIVERED"
                    act_deliv = delivered_time.strftime("%Y-%m-%d %H:%M:%S")
                    ship_deliv = act_deliv
                    ship_ofd = out_for_delivery_time.strftime("%Y-%m-%d %H:%M:%S")

                # Order Record
                orders.append(Order(
                    order_id=order_id,
                    order_number=order_number,
                    customer_id=cust.customer_id,
                    warehouse_id=wh.warehouse_id,
                    carrier_id=carrier.carrier_id,
                    region_id=cust.region_id,
                    order_status=order_status,
                    order_date=order_time_str,
                    promised_delivery_date=promised_time.strftime("%Y-%m-%d %H:%M:%S"),
                    actual_delivery_date=act_deliv,
                    total_amount=total_amount,
                    items_count=num_items,
                    is_sla_breached=is_sla_breached if order_status == "DELIVERED" else False,
                    sla_breach_reason=sla_breach_reason if order_status == "DELIVERED" and is_sla_breached else None,
                    created_at=order_time_str
                ))

                # Shipment Record
                shipment_id = f"SHP_{order_seq:08d}"
                tracking_no = f"TRK{carrier.code if hasattr(carrier, 'code') else carrier.carrier_id[:3]}-{order_seq:08d}"
                shipments.append(Shipment(
                    shipment_id=shipment_id,
                    order_id=order_id,
                    warehouse_id=wh.warehouse_id,
                    carrier_id=carrier.carrier_id,
                    tracking_number=tracking_no,
                    origin_hub=f"{wh.city} Hub",
                    destination_hub=f"{cust.city} Gateway",
                    weight_kg=total_weight,
                    status=order_status,
                    created_at=order_time_str,
                    packed_at=packed_time.strftime("%Y-%m-%d %H:%M:%S"),
                    carrier_picked_up_at=pickup_time.strftime("%Y-%m-%d %H:%M:%S") if hours_ago >= 12 else None,
                    out_for_delivery_at=ship_ofd,
                    delivered_at=ship_deliv
                ))

                # Delivery Events Stream
                events_timeline = [
                    ("ORDER_CREATED", order_time, f"{wh.city} Origin", "Order received and validated"),
                    ("PAYMENT_CONFIRMED", order_time + datetime.timedelta(minutes=2), f"{wh.city} Origin", f"Payment confirmed via {pay_method}"),
                    ("INVENTORY_RESERVED", order_time + datetime.timedelta(minutes=5), wh.name, "Inventory allocated from shelf"),
                    ("ORDER_PACKED", packed_time, wh.name, f"Box packaged (Weight: {total_weight}kg)"),
                ]

                if hours_ago >= 12:
                    events_timeline.append(("CARRIER_PICKED_UP", pickup_time, f"{wh.city} Carrier Dock", f"Picked up by {carrier.name}"))
                if ship_ofd:
                    events_timeline.append(("OUT_FOR_DELIVERY", out_for_delivery_time, f"{cust.city} Delivery Hub", "Assigned to final mile delivery associate"))
                if ship_deliv:
                    events_timeline.append(("DELIVERED", delivered_time, f"{cust.city} Customer Address", "Successfully delivered to customer"))

                for ev_type, ev_time, ev_loc, ev_note in events_timeline:
                    delivery_events.append(DeliveryEvent(
                        event_id=f"EVT_{event_seq:09d}",
                        shipment_id=shipment_id,
                        order_id=order_id,
                        event_type=ev_type,
                        timestamp=ev_time.strftime("%Y-%m-%d %H:%M:%S"),
                        location=ev_loc,
                        note=ev_note
                    ))
                    event_seq += 1

                # Causal Support Ticket Generation
                # Late deliveries significantly increase probability of customer delay complaints
                if is_sla_breached and self.rng.random() < 0.42:
                    t_created = delivered_time + datetime.timedelta(hours=self.rng.uniform(1.0, 8.0))
                    t_resolved = t_created + datetime.timedelta(hours=self.rng.uniform(4.0, 48.0)) if day_num < self.days - 1 else None
                    csat = self.rng.choice([1, 2, 3]) if t_resolved else None
                    
                    support_tickets.append(SupportTicket(
                        ticket_id=f"TCK_{ticket_seq:07d}",
                        order_id=order_id,
                        customer_id=cust.customer_id,
                        category="DELIVERY_DELAY",
                        priority="HIGH" if cust.tier == "VIP_ENTERPRISE" else "MEDIUM",
                        status="RESOLVED" if t_resolved else "OPEN",
                        subject=f"Shipment exceeded promised delivery SLA (Breach: {sla_breach_reason})",
                        created_at=t_created.strftime("%Y-%m-%d %H:%M:%S"),
                        resolved_at=t_resolved.strftime("%Y-%m-%d %H:%M:%S") if t_resolved else None,
                        csat_score=csat
                    ))
                    ticket_seq += 1

                order_seq += 1

        return orders, order_items, shipments, delivery_events, payments, support_tickets
