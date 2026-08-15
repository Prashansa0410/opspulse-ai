# OpsPulse AI: Data Model & Schema Specification

## 1. Entity Relationship Overview

OpsPulse AI structures operational data into raw operational entities, dimensional staging models, and materialized analytical marts.

```
+--------------------+        +---------------------+        +--------------------+
|     customers      |        |     warehouses      |        |      carriers      |
+--------------------+        +---------------------+        +--------------------+
| customer_id (PK)   |        | warehouse_id (PK)   |        | carrier_id (PK)    |
| name, email        |        | name, code, city    |        | name, service_type |
| tier, segment      |        | capacity_per_day    |        | base_sla_hours     |
| region_id (FK)     |        | current_utilization |        | cost_per_kg        |
+--------------------+        +---------------------+        +--------------------+
          \                              |                             /
           \                             |                            /
            +----------------------------+---------------------------+
                                         |
                                         v
                              +--------------------+
                              |       orders       |
                              +--------------------+
                              | order_id (PK)      |
                              | order_number (UQ)  |
                              | customer_id (FK)   |
                              | warehouse_id (FK)  |
                              | carrier_id (FK)    |
                              | order_status       |
                              | order_date         |
                              | promised_delivery  |
                              | actual_delivery    |
                              | total_amount       |
                              | is_sla_breached    |
                              | sla_breach_reason  |
                              +--------------------+
                             /          |           \
                            /           |            \
                           v            v             v
            +----------------+   +---------------+   +-------------------+
            |  order_items   |   |   shipments   |   |     payments      |
            +----------------+   +---------------+   +-------------------+
            | item_id (PK)   |   | shipment_id   |   | payment_id (PK)   |
            | order_id (FK)  |   | order_id (FK) |   | order_id (FK)     |
            | product_id (FK)|   | status        |   | provider, amount  |
            | quantity, price|   | packed_at     |   | status, failure_r |
            +----------------+   | delivered_at  |   +-------------------+
                                 +---------------+
                                         |
                                         v
                              +--------------------+
                              |  delivery_events   |
                              +--------------------+
                              | event_id (PK)      |
                              | shipment_id (FK)   |
                              | event_type         |
                              | timestamp          |
                              | location, note     |
                              +--------------------+
```

---

## 2. Analytical Marts Schema

### `fct_daily_kpis`
- **Primary Key**: `kpi_date` (VARCHAR)
- **Metrics**: `total_orders`, `total_revenue`, `total_gmv`, `on_time_delivery_rate`, `sla_breach_rate`, `gmv_at_risk`, `avg_fulfillment_hours`, `avg_warehouse_hours`, `avg_carrier_pickup_delay_hours`, `avg_transit_hours`, `payment_failure_rate`, `support_ticket_rate`.

### `fct_warehouse_performance`
- **Primary Key**: `id` (`kpi_date_warehouse_id`)
- **Metrics**: `utilization_rate`, `avg_packing_time_hours`, `sla_breach_count`, `sla_breach_rate`, `backlog_count`.

### `fct_carrier_performance`
- **Primary Key**: `id` (`kpi_date_carrier_id`)
- **Metrics**: `total_shipments`, `on_time_rate`, `avg_pickup_delay_hours`, `avg_transit_time_hours`, `delivery_failed_count`.

### `fct_anomaly_events`
- **Primary Key**: `anomaly_id`
- **Attributes**: `detected_at`, `metric_name`, `entity_type`, `entity_name`, `severity` (NORMAL/WARNING/CRITICAL), `expected_value`, `actual_value`, `deviation_percent`, `z_score`, `summary`, `root_cause_hint`.

### `dq_audit_log`
- **Primary Key**: `log_id`
- **Attributes**: `audit_date`, `total_checks`, `passed_checks`, `failed_checks`, `dq_score_pct`, `critical_issues_count`, `warnings_count`, `details_json`.
