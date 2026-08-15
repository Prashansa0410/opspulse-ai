-- ============================================================================
-- OpsPulse AI - Supabase / PostgreSQL Schema Definition
-- Zero-Cost Portfolio Cloud Deployment Target
-- ============================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Dimensions
CREATE TABLE IF NOT EXISTS dim_regions (
    region_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(50) DEFAULT 'India',
    is_metro BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dim_customers (
    customer_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(50),
    tier VARCHAR(20) DEFAULT 'STANDARD',
    segment VARCHAR(50) DEFAULT 'B2C',
    region_id VARCHAR(50) REFERENCES dim_regions(region_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dim_products (
    product_id VARCHAR(50) PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    weight_kg NUMERIC(8, 2) DEFAULT 1.0,
    unit_price NUMERIC(10, 2) NOT NULL,
    is_fragile BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dim_warehouses (
    warehouse_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    region_id VARCHAR(50) REFERENCES dim_regions(region_id),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    capacity_orders_per_day INTEGER NOT NULL,
    current_utilization_pct NUMERIC(5, 2) DEFAULT 50.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dim_carriers (
    carrier_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    base_sla_hours INTEGER NOT NULL,
    cost_per_kg NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Operational Lifecycle Tables
CREATE TABLE IF NOT EXISTS orders (
    order_id VARCHAR(50) PRIMARY KEY,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id VARCHAR(50) REFERENCES dim_customers(customer_id),
    warehouse_id VARCHAR(50) REFERENCES dim_warehouses(warehouse_id),
    carrier_id VARCHAR(50) REFERENCES dim_carriers(carrier_id),
    order_status VARCHAR(50) NOT NULL,
    order_date TIMESTAMP NOT NULL,
    promised_delivery_date TIMESTAMP NOT NULL,
    actual_delivery_date TIMESTAMP,
    total_amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    is_sla_breached BOOLEAN DEFAULT FALSE,
    sla_breach_reason VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    item_id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(order_id),
    product_id VARCHAR(50) REFERENCES dim_products(product_id),
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS shipments (
    shipment_id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(order_id),
    carrier_id VARCHAR(50) REFERENCES dim_carriers(carrier_id),
    warehouse_id VARCHAR(50) REFERENCES dim_warehouses(warehouse_id),
    status VARCHAR(50) NOT NULL,
    packed_at TIMESTAMP,
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    sla_hours INTEGER NOT NULL,
    pickup_delay_hours NUMERIC(6, 2) DEFAULT 0.0,
    transit_time_hours NUMERIC(6, 2) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS delivery_events (
    event_id VARCHAR(50) PRIMARY KEY,
    shipment_id VARCHAR(50) REFERENCES shipments(shipment_id),
    event_type VARCHAR(50) NOT NULL,
    event_timestamp TIMESTAMP NOT NULL,
    location VARCHAR(150),
    note TEXT
);

CREATE TABLE IF NOT EXISTS payments (
    payment_id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(order_id),
    payment_provider VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) NOT NULL,
    payment_date TIMESTAMP NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    failure_reason VARCHAR(150)
);

CREATE TABLE IF NOT EXISTS support_tickets (
    ticket_id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(order_id),
    category VARCHAR(100) NOT NULL,
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    status VARCHAR(50) DEFAULT 'OPEN',
    created_at TIMESTAMP NOT NULL,
    resolved_at TIMESTAMP
);

-- 3. Analytical Fact Marts
CREATE TABLE IF NOT EXISTS fct_daily_kpis (
    kpi_date VARCHAR(20) PRIMARY KEY,
    total_orders INTEGER NOT NULL,
    total_revenue NUMERIC(14, 2) NOT NULL,
    total_gmv NUMERIC(14, 2) NOT NULL,
    on_time_delivery_rate NUMERIC(5, 2) NOT NULL,
    sla_breach_rate NUMERIC(5, 2) NOT NULL,
    gmv_at_risk NUMERIC(14, 2) NOT NULL,
    avg_fulfillment_hours NUMERIC(6, 2) NOT NULL,
    avg_warehouse_hours NUMERIC(6, 2) NOT NULL,
    avg_carrier_pickup_delay_hours NUMERIC(6, 2) NOT NULL,
    avg_transit_hours NUMERIC(6, 2) NOT NULL,
    payment_failure_rate NUMERIC(5, 2) NOT NULL,
    support_ticket_rate NUMERIC(5, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS fct_warehouse_performance (
    id VARCHAR(100) PRIMARY KEY,
    kpi_date VARCHAR(20) NOT NULL,
    warehouse_id VARCHAR(50) REFERENCES dim_warehouses(warehouse_id),
    warehouse_name VARCHAR(150),
    code VARCHAR(50),
    total_orders_assigned INTEGER NOT NULL,
    total_orders_packed INTEGER NOT NULL,
    utilization_rate NUMERIC(5, 2) NOT NULL,
    avg_packing_time_hours NUMERIC(6, 2) NOT NULL,
    sla_breach_count INTEGER NOT NULL,
    sla_breach_rate NUMERIC(5, 2) NOT NULL,
    backlog_count INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS fct_carrier_performance (
    id VARCHAR(100) PRIMARY KEY,
    kpi_date VARCHAR(20) NOT NULL,
    carrier_id VARCHAR(50) REFERENCES dim_carriers(carrier_id),
    carrier_name VARCHAR(100),
    total_shipments INTEGER NOT NULL,
    on_time_shipments INTEGER NOT NULL,
    delayed_shipments INTEGER NOT NULL,
    on_time_rate NUMERIC(5, 2) NOT NULL,
    avg_pickup_delay_hours NUMERIC(6, 2) NOT NULL,
    avg_transit_time_hours NUMERIC(6, 2) NOT NULL,
    delivery_failed_count INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS fct_regional_performance (
    id VARCHAR(100) PRIMARY KEY,
    kpi_date VARCHAR(20) NOT NULL,
    region_id VARCHAR(50) REFERENCES dim_regions(region_id),
    region_name VARCHAR(100),
    total_orders INTEGER NOT NULL,
    total_revenue NUMERIC(14, 2) NOT NULL,
    sla_breach_rate NUMERIC(5, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS dq_audit_log (
    log_id VARCHAR(50) PRIMARY KEY,
    audit_date VARCHAR(20) NOT NULL,
    total_checks INTEGER NOT NULL,
    passed_checks INTEGER NOT NULL,
    failed_checks INTEGER NOT NULL,
    dq_score_pct NUMERIC(5, 2) NOT NULL,
    critical_issues_count INTEGER NOT NULL,
    warnings_count INTEGER NOT NULL,
    details_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fct_anomaly_events (
    anomaly_id VARCHAR(50) PRIMARY KEY,
    detected_at TIMESTAMP NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50),
    entity_name VARCHAR(150),
    severity VARCHAR(20) NOT NULL,
    expected_value NUMERIC(10, 2),
    actual_value NUMERIC(10, 2),
    deviation_percent NUMERIC(8, 2),
    z_score NUMERIC(5, 2),
    summary TEXT,
    root_cause_hint TEXT
);

CREATE TABLE IF NOT EXISTS simulation_runs (
    simulation_id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    source_warehouse_id VARCHAR(50),
    target_warehouse_id VARCHAR(50),
    volume_shift_pct NUMERIC(5, 2),
    baseline_otd NUMERIC(5, 2),
    simulated_otd NUMERIC(5, 2),
    expected_lift NUMERIC(5, 2),
    gmv_saved NUMERIC(14, 2),
    confidence_score NUMERIC(5, 2),
    status VARCHAR(50) DEFAULT 'COMPLETED'
);

CREATE TABLE IF NOT EXISTS ai_recommendations (
    recommendation_id VARCHAR(50) PRIMARY KEY,
    query VARCHAR(500) NOT NULL,
    recommendation_text TEXT NOT NULL,
    supporting_evidence_json TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewer_id VARCHAR(100),
    reviewed_at TIMESTAMP,
    reviewer_comments TEXT
);
