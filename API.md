# OpsPulse AI: REST API Documentation

Base URL: `http://localhost:8000/api/v1`  
OpenAPI Documentation: `http://localhost:8000/docs`  

---

## 1. Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/kpis` | Headline operational KPIs, period deltas, top alerts, and historical trend timeseries. |
| `GET` | `/api/v1/warehouses` | Warehouse utilization, throughput, backlog, and SLA breach scorecards. |
| `GET` | `/api/v1/carriers` | 3PL carrier on-time delivery percentages, pickup delays, and transit durations. |
| `GET` | `/api/v1/orders` | Multi-dimensional order exploration with pagination and SLA breach filtering. |
| `GET` | `/api/v1/sla-risk` | Predictive SLA breach risk scores and in-flight high-risk shipment priority queue. |
| `GET` | `/api/v1/anomalies` | Detected operational anomalies via rolling Z-score & Isolation Forest. |
| `GET` | `/api/v1/root-causes`| Multi-dimensional mathematical RCA decomposition of SLA drops. |
| `POST`| `/api/v1/simulations`| Run What-If operational volume reallocation simulation. |
| `POST`| `/api/v1/ai/query` | Natural language question answering with tool execution traces and citations. |
| `GET` | `/api/v1/data-quality`| Data Quality audit health report and 8 rule validation results. |
| `GET` | `/api/v1/health` | System health, database connectivity, and component telemetry. |
| `GET` | `/metrics` | Prometheus metrics exposition format for scraping. |

---

## 2. Sample Request & Response Payloads

### A. Ask AI Operations Analyst
```http
POST /api/v1/ai/query
Content-Type: application/json

{
  "query": "Why did on-time delivery fall yesterday?"
}
```

**Response**:
```json
{
  "query": "Why did on-time delivery fall yesterday?",
  "response": "### Root Cause Analysis: On-Time Delivery Decline\n\nOn-Time Delivery dropped from 93.8% to 88.7% (-5.1% drop)...",
  "tool_calls": [
    {
      "tool": "get_root_causes",
      "args": { "metric": "on_time_delivery_rate" },
      "status": "SUCCESS"
    }
  ],
  "citations": ["fct_daily_kpis, orders, shipments table attribution"],
  "latency_ms": 12.4,
  "timestamp": "2026-08-15 05:25:30"
}
```

### B. What-If Simulation
```http
POST /api/v1/simulations
Content-Type: application/json

{
  "title": "Reallocate 18% Weekend Volume BLR-01 -> BLR-02",
  "intervention_type": "WAREHOUSE_VOLUME_REALLOCATION",
  "source_warehouse_id": "WH_BLR_01",
  "target_warehouse_id": "WH_BLR_02",
  "volume_shift_pct": 18.0
}
```
