-- OpsPulse AI Database Schema
-- Compatible with DuckDB, PostgreSQL, and SQLite

-- ============================================================================
-- 1. DIMENSION & STATIC REFERENCE TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS regions (
    region_id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL,
    state VARCHAR(50) NOT NULL,
    metro_type VARCHAR(20) NOT NULL,
    risk_level VARCHAR(20) NOT NULL DEFAULT 'LOW'
);

CREATE TABLE IF NOT EXISTS warehouses (
    warehouse_id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    region_id VARCHAR(32) NOT NULL,
    capacity_orders_per_day INT NOT NULL,
    current_utilization DOUBLE NOT NULL DEFAULT 0.65,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    manager_name VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS carriers (
    carrier_id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    base_sla_hours INT NOT NULL,
    cost_per_kg DOUBLE NOT NULL,
    on_time_baseline_rate DOUBLE NOT NULL DEFAULT 0.95,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS products (
    product_id VARCHAR(32) PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DOUBLE NOT NULL,
    weight_kg DOUBLE NOT NULL,
    is_fragile BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS customers (
    customer_id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    tier VARCHAR(20) NOT NULL DEFAULT 'STANDARD',
    segment VARCHAR(50) NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    region_id VARCHAR(32) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    signup_date TIMESTAMP NOT NULL
);

-- ============================================================================
-- 2. OPERATIONAL & TRANSACTIONAL TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS inventory (
    inventory_id VARCHAR(32) PRIMARY KEY,
    warehouse_id VARCHAR(32) NOT NULL,
    product_id VARCHAR(32) NOT NULL,
    stock_on_hand INT NOT NULL DEFAULT 0,
    reserved_stock INT NOT NULL DEFAULT 0,
    reorder_point INT NOT NULL DEFAULT 20,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
    order_id VARCHAR(32) PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id VARCHAR(32) NOT NULL,
    warehouse_id VARCHAR(32) NOT NULL,
    carrier_id VARCHAR(32) NOT NULL,
    region_id VARCHAR(32) NOT NULL,
    order_status VARCHAR(30) NOT NULL,
    order_date TIMESTAMP NOT NULL,
    promised_delivery_date TIMESTAMP NOT NULL,
    actual_delivery_date TIMESTAMP,
    total_amount DOUBLE NOT NULL,
    items_count INT NOT NULL,
    is_sla_breached BOOLEAN NOT NULL DEFAULT FALSE,
    sla_breach_reason VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    item_id VARCHAR(32) PRIMARY KEY,
    order_id VARCHAR(32) NOT NULL,
    product_id VARCHAR(32) NOT NULL,
    quantity INT NOT NULL,
    unit_price DOUBLE NOT NULL,
    total_price DOUBLE NOT NULL
);

CREATE TABLE IF NOT EXISTS shipments (
    shipment_id VARCHAR(32) PRIMARY KEY,
    order_id VARCHAR(32) NOT NULL,
    warehouse_id VARCHAR(32) NOT NULL,
    carrier_id VARCHAR(32) NOT NULL,
    tracking_number VARCHAR(100) NOT NULL,
    origin_hub VARCHAR(100) NOT NULL,
    destination_hub VARCHAR(100) NOT NULL,
    weight_kg DOUBLE NOT NULL,
    status VARCHAR(30) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    packed_at TIMESTAMP,
    carrier_picked_up_at TIMESTAMP,
    out_for_delivery_at TIMESTAMP,
    delivered_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS delivery_events (
    event_id VARCHAR(32) PRIMARY KEY,
    shipment_id VARCHAR(32) NOT NULL,
    order_id VARCHAR(32) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    location VARCHAR(100) NOT NULL,
    note VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS payments (
    payment_id VARCHAR(32) PRIMARY KEY,
    order_id VARCHAR(32) NOT NULL,
    customer_id VARCHAR(32) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    amount DOUBLE NOT NULL,
    status VARCHAR(30) NOT NULL,
    failure_reason VARCHAR(150),
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS support_tickets (
    ticket_id VARCHAR(32) PRIMARY KEY,
    order_id VARCHAR(32),
    customer_id VARCHAR(32) NOT NULL,
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    status VARCHAR(30) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    resolved_at TIMESTAMP,
    csat_score INT
);

-- ============================================================================
-- 3. ANALYTICAL MARTS & SUMMARY TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS fct_daily_kpis (
    kpi_date VARCHAR(10) PRIMARY KEY,
    total_orders INT NOT NULL,
    total_revenue DOUBLE NOT NULL,
    total_gmv DOUBLE NOT NULL,
    on_time_delivery_rate DOUBLE NOT NULL,
    sla_breach_rate DOUBLE NOT NULL,
    gmv_at_risk DOUBLE NOT NULL,
    avg_fulfillment_hours DOUBLE NOT NULL,
    avg_warehouse_hours DOUBLE NOT NULL,
    avg_carrier_pickup_delay_hours DOUBLE NOT NULL,
    avg_transit_hours DOUBLE NOT NULL,
    return_rate DOUBLE NOT NULL,
    payment_failure_rate DOUBLE NOT NULL,
    support_ticket_rate DOUBLE NOT NULL,
    customer_complaint_rate DOUBLE NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fct_warehouse_performance (
    id VARCHAR(64) PRIMARY KEY,
    kpi_date VARCHAR(10) NOT NULL,
    warehouse_id VARCHAR(32) NOT NULL,
    warehouse_name VARCHAR(100) NOT NULL,
    total_orders_assigned INT NOT NULL,
    orders_packed INT NOT NULL,
    utilization_rate DOUBLE NOT NULL,
    avg_packing_time_hours DOUBLE NOT NULL,
    sla_breach_count INT NOT NULL,
    sla_breach_rate DOUBLE NOT NULL,
    backlog_count INT NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fct_carrier_performance (
    id VARCHAR(64) PRIMARY KEY,
    kpi_date VARCHAR(10) NOT NULL,
    carrier_id VARCHAR(32) NOT NULL,
    carrier_name VARCHAR(100) NOT NULL,
    total_shipments INT NOT NULL,
    delivered_on_time_count INT NOT NULL,
    on_time_rate DOUBLE NOT NULL,
    avg_pickup_delay_hours DOUBLE NOT NULL,
    avg_transit_time_hours DOUBLE NOT NULL,
    delivery_failed_count INT NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fct_regional_performance (
    id VARCHAR(64) PRIMARY KEY,
    kpi_date VARCHAR(10) NOT NULL,
    region_id VARCHAR(32) NOT NULL,
    region_name VARCHAR(100) NOT NULL,
    total_orders INT NOT NULL,
    sla_breached_count INT NOT NULL,
    on_time_rate DOUBLE NOT NULL,
    gmv_at_risk DOUBLE NOT NULL,
    top_bottleneck VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS fct_anomaly_events (
    anomaly_id VARCHAR(32) PRIMARY KEY,
    detected_at TIMESTAMP NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL, -- 'NORMAL', 'WARNING', 'CRITICAL'
    expected_value DOUBLE NOT NULL,
    actual_value DOUBLE NOT NULL,
    deviation_percent DOUBLE NOT NULL,
    z_score DOUBLE NOT NULL,
    summary VARCHAR(255) NOT NULL,
    root_cause_hint VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS fct_simulations (
    simulation_id VARCHAR(32) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    intervention_type VARCHAR(50) NOT NULL,
    source_warehouse_id VARCHAR(32),
    target_warehouse_id VARCHAR(32),
    volume_shift_pct DOUBLE,
    carrier_id VARCHAR(32),
    additional_capacity_pct DOUBLE,
    status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',
    baseline_otd_rate DOUBLE NOT NULL,
    simulated_otd_rate DOUBLE NOT NULL,
    expected_otd_lift DOUBLE NOT NULL,
    gmv_saved DOUBLE NOT NULL,
    confidence_score DOUBLE NOT NULL,
    risks_notes VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dq_audit_log (
    log_id VARCHAR(32) PRIMARY KEY,
    audit_date VARCHAR(10) NOT NULL,
    total_checks INT NOT NULL,
    passed_checks INT NOT NULL,
    failed_checks INT NOT NULL,
    dq_score_pct DOUBLE NOT NULL,
    critical_issues_count INT NOT NULL,
    warnings_count INT NOT NULL,
    details_json TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_recommendations (
    recommendation_id VARCHAR(32) PRIMARY KEY,
    query VARCHAR(500) NOT NULL,
    recommendation_text TEXT NOT NULL,
    supporting_evidence_json TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_by VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewer_id VARCHAR(50),
    reviewed_at TIMESTAMP,
    reviewer_comments TEXT
);
