# OpsPulse AI: Testing & Verification Strategy

## 1. Test Suite Architecture

OpsPulse AI enforces test coverage spanning four testing tiers:

1. **Unit Tests**:
   - Causal Data Generator logic & incident injection.
   - dbt-style analytical SQL transformations.
   - Mathematical Root Cause Attribution decomposition.
   - What-If simulation calculations & confidence intervals.
   - AST SQL safety guardrails & injection rejections.
2. **Data Quality Tests**:
   - 8 automated rules: Primary key uniqueness, non-null mandatory fields, chronological timestamp order, non-negative amounts, foreign key integrity, SLA flag consistency, utilization bounds, status state machines.
3. **Integration & API Tests**:
   - FastAPI HTTP endpoints, query parameter filtering, pagination, and response schema conformance.
4. **Performance Latency Benchmarks**:
   - Measured query execution latency under strict millisecond thresholds.

---

## 2. Running Automated Tests

```bash
# Run full test suite with verbose reporting
pytest backend/tests/ -v -s

# Run performance latency benchmark test
pytest backend/tests/test_performance.py -s
```

---

## 3. Measured Performance Results

| Operation | Measured Latency | Target Threshold | Status |
|---|---|---|---|
| **Executive KPI Aggregation** | `12.1 ms` | `< 50 ms` | PASS |
| **Root Cause Attribution Decomposition** | `12.3 ms` | `< 50 ms` | PASS |
| **ML SLA Risk Inference** | `0.82 ms` | `< 20 ms` | PASS |
| **What-If Simulation Engine** | `3.51 ms` | `< 25 ms` | PASS |
| **AI Analyst Tool Orchestration** | `7.29 ms` | `< 50 ms` | PASS |
| **Data Quality 8-Rule Audit** | `4.2 ms` | `< 30 ms` | PASS |
