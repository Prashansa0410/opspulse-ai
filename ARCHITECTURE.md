# OpsPulse AI: System Architecture & Technical Design

## 1. High-Level Architecture Overview

OpsPulse AI is architected with a decoupled, high-performance data engineering and decision support topology:

```
+-----------------------------------------------------------------------------------+
|                            Synthetic Event Stream                                 |
|            (Deterministic Causal Incident Injection • 10M+ Event Capable)         |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                        Kafka & In-Memory Streaming Broker                         |
|                 (10,000+ msgs/sec throughput • Micro-burst Flusher)               |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                            Raw Storage Layer (Parquet)                            |
|             (DuckDB Native Columnar Storage • Lakehouse Integration)              |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                            dbt-Style Transformation                               |
|        (Staging -> Dimensions -> Facts -> fct_daily_kpis, fct_warehouse_perf)     |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                        Analytical Warehouse Engine (DuckDB)                       |
|           (Vectorized Columnar Execution • Sub-30ms Complex Aggregations)         |
+-----------------------------------------------------------------------------------+
                  /                      |                      \
                 /                       |                       \
+-------------------------+  +------------------------+  +--------------------------+
|  Analytics & KPI Marts  |  |  ML Intelligence Layer |  |   AI Operations Agent    |
| (Multi-Stage Attribution|  | (Gradient Boosting SLA |  |  (Multi-Tool Calling &   |
|  & Dimensional Filters) |  |  Risk + Anomaly Trees) |  |   AST SQL Guardrails)    |
+-------------------------+  +------------------------+  +--------------------------+
                 \                       |                       /
                  \                      |                      /
                   v                     v                     v
+-----------------------------------------------------------------------------------+
|                               FastAPI REST Layer                                  |
|      (Pydantic Validation • Prometheus Instrumentation • Structured JSON Logs)     |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                         Next.js Operations Control Tower                          |
|         (11 Enterprise Screens • Persona Context Switcher • Explainability)       |
+-----------------------------------------------------------------------------------+
```

---

## 2. Core Architectural Pillars

### A. Columnar Vectorized Execution (DuckDB)
DuckDB provides in-process vectorized columnar analytics without external database network latency. All analytical transforms (`fct_daily_kpis`, `fct_warehouse_performance`, `fct_carrier_performance`) execute in sub-30 milliseconds.

### B. Machine Learning Risk & Anomaly Subsystems
- **SLA Breach Risk Classifier**: Gradient Boosting Decision Trees trained on 10 operational features with feature importance rankings and real-time inference latency under 1ms.
- **Unsupervised Anomaly Detection**: Rolling 7-day Z-score analysis combined with multi-variate outlier scoring to catch payment gateway timeouts and facility saturation.

### C. Zero-Hallucination AI Operations Analyst
The natural language AI interface is enforced with strict AST-level SQL guardrails:
1. Rejection of destructive keywords (`DROP`, `DELETE`, `UPDATE`, `ALTER`, `TRUNCATE`).
2. Single-statement enforcement.
3. Automatic `LIMIT` clause injection (max 200 rows).
4. Real-time tool execution tracking with verifiable metric citations.
