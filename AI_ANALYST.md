# OpsPulse AI: AI Operations Analyst & Guardrails Specification

## 1. Agent Architecture & Execution Flow

```
[User Question]
       |
       v
[Intent Detection & Entity Parsing]
       |
       v
[Tool Selection (from 9-Tool Registry)]
       |
       v
[AST SQL Safety Sanitizer & Guardrails]
       |
       v
[Analytical Query Execution on DuckDB]
       |
       v
[Zero-Hallucination Response Formatting + Citations]
```

---

## 2. Tool Registry

1. `get_kpi(metric_name, days)`: Fetches headline operational KPIs and trend series.
2. `run_sql(query)`: Executes read-only SQL queries with automatic `LIMIT` clause injection.
3. `get_warehouse_performance(warehouse_id)`: Diagnoses facility utilization, packing speed, and backlog.
4. `get_carrier_performance(carrier_id)`: Evaluates 3PL on-time compliance and pickup lag.
5. `get_sla_risk(limit)`: Runs real-time ML risk scoring on in-flight shipments.
6. `detect_anomalies()`: Scans rolling baselines with Z-scores and Isolation Forests.
7. `get_root_causes(metric)`: Performs mathematical multi-stage attribution on SLA drops.
8. `simulate_intervention(source_wh, target_wh, shift_pct)`: Executes What-If volume shifts.
9. `generate_recommendation()`: Synthesizes structured tactical action plans.

---

## 3. AST SQL Guardrails & Security Policies

- **Strict Read-Only**: Only `SELECT` statements are parsed and accepted.
- **Destructive Command Rejection**: Any query containing `DROP`, `DELETE`, `UPDATE`, `INSERT`, `ALTER`, `TRUNCATE`, `GRANT`, `REVOKE`, `ATTACH`, `LOAD` is blocked immediately with a `SQLSecurityException`.
- **Single Statement Enforcement**: Multi-statement chaining via semicolons is rejected.
- **Enforced Row Limits**: Every query is automatically bounded with `LIMIT 200` to prevent memory denial-of-service.
