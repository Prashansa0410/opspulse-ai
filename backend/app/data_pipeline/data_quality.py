"""Data Quality Validation & Scoring Framework for OpsPulse AI."""
import json
import logging
import uuid
import datetime
from dataclasses import dataclass, asdict
from typing import Any
from backend.app.db.session import db_manager

logger = logging.getLogger("opspulse.dq")


@dataclass
class DQRuleResult:
    rule_id: str
    rule_name: str
    category: str
    severity: str  # 'CRITICAL', 'WARNING', 'INFO'
    status: str    # 'PASSED', 'FAILED'
    table_name: str
    records_checked: int
    failed_records_count: int
    failure_rate_pct: float
    description: str
    sample_failures: list[dict[str, Any]]


@dataclass
class DQReport:
    log_id: str
    audit_date: str
    total_checks: int
    passed_checks: int
    failed_checks: int
    dq_score_pct: float
    critical_issues_count: int
    warnings_count: int
    rules_results: list[DQRuleResult]


class DataQualityFramework:
    """Runs data quality validation rules and computes composite data health score."""

    def __init__(self, db=db_manager):
        self.db = db

    def run_all_checks(self) -> DQReport:
        """Execute all data quality tests against analytical and raw tables."""
        logger.info("Running Data Quality validation suite...")
        conn = self.db.get_connection()
        rules_results: list[DQRuleResult] = []

        # -------------------------------------------------------------
        # Rule 1: Primary Key Uniqueness on Orders
        # -------------------------------------------------------------
        res = conn.execute("""
            SELECT COUNT(*) AS total, COUNT(DISTINCT order_id) AS distinct_pks
            FROM orders;
        """).fetchall()[0]
        total_orders, distinct_pks = res[0], res[1]
        dup_orders = max(0, total_orders - distinct_pks)
        rules_results.append(DQRuleResult(
            rule_id="DQ-001",
            rule_name="Primary Key Uniqueness - orders",
            category="UNIQUENESS",
            severity="CRITICAL",
            status="PASSED" if dup_orders == 0 else "FAILED",
            table_name="orders",
            records_checked=total_orders,
            failed_records_count=dup_orders,
            failure_rate_pct=round((dup_orders / max(1, total_orders)) * 100.0, 4),
            description="Ensures every order has a globally unique order_id primary key",
            sample_failures=[]
        ))

        # -------------------------------------------------------------
        # Rule 2: Mandatory Columns Non-Null Check
        # -------------------------------------------------------------
        res = conn.execute("""
            SELECT COUNT(*) FROM orders 
            WHERE order_date IS NULL OR total_amount IS NULL OR customer_id IS NULL OR warehouse_id IS NULL;
        """).fetchone()
        null_orders = res[0] if res else 0
        rules_results.append(DQRuleResult(
            rule_id="DQ-002",
            rule_name="Mandatory Column Completeness",
            category="COMPLETENESS",
            severity="CRITICAL",
            status="PASSED" if null_orders == 0 else "FAILED",
            table_name="orders",
            records_checked=total_orders,
            failed_records_count=null_orders,
            failure_rate_pct=round((null_orders / max(1, total_orders)) * 100.0, 4),
            description="Verifies non-null constraints on order timestamps, amounts, and foreign keys",
            sample_failures=[]
        ))

        # -------------------------------------------------------------
        # Rule 3: Valid Chronological Timestamps in Shipments
        # -------------------------------------------------------------
        res = conn.execute("""
            SELECT COUNT(*) FROM shipments
            WHERE (packed_at IS NOT NULL AND CAST(packed_at AS TIMESTAMP) < CAST(created_at AS TIMESTAMP))
               OR (carrier_picked_up_at IS NOT NULL AND packed_at IS NOT NULL AND CAST(carrier_picked_up_at AS TIMESTAMP) < CAST(packed_at AS TIMESTAMP))
               OR (delivered_at IS NOT NULL AND carrier_picked_up_at IS NOT NULL AND CAST(delivered_at AS TIMESTAMP) < CAST(carrier_picked_up_at AS TIMESTAMP));
        """).fetchone()
        time_inversions = res[0] if res else 0
        total_shipments = conn.execute("SELECT COUNT(*) FROM shipments").fetchone()[0]
        rules_results.append(DQRuleResult(
            rule_id="DQ-003",
            rule_name="Lifecycle Chronology Validation",
            category="TIMELINESS",
            severity="CRITICAL",
            status="PASSED" if time_inversions == 0 else "FAILED",
            table_name="shipments",
            records_checked=total_shipments,
            failed_records_count=time_inversions,
            failure_rate_pct=round((time_inversions / max(1, total_shipments)) * 100.0, 4),
            description="Ensures created_at <= packed_at <= carrier_picked_up_at <= delivered_at",
            sample_failures=[]
        ))

        # -------------------------------------------------------------
        # Rule 4: Non-negative Amounts and Quantities
        # -------------------------------------------------------------
        res = conn.execute("""
            SELECT COUNT(*) FROM order_items WHERE quantity <= 0 OR unit_price < 0 OR total_price < 0;
        """).fetchone()
        invalid_items = res[0] if res else 0
        total_items = conn.execute("SELECT COUNT(*) FROM order_items").fetchone()[0]
        rules_results.append(DQRuleResult(
            rule_id="DQ-004",
            rule_name="Non-Negative Financial Values",
            category="VALIDITY",
            severity="CRITICAL",
            status="PASSED" if invalid_items == 0 else "FAILED",
            table_name="order_items",
            records_checked=total_items,
            failed_records_count=invalid_items,
            failure_rate_pct=round((invalid_items / max(1, total_items)) * 100.0, 4),
            description="Validates quantities > 0 and monetary prices >= 0",
            sample_failures=[]
        ))

        # -------------------------------------------------------------
        # Rule 5: Referential Integrity (Foreign Key Validation)
        # -------------------------------------------------------------
        res = conn.execute("""
            SELECT COUNT(*) FROM orders o
            LEFT JOIN customers c ON o.customer_id = c.customer_id
            WHERE c.customer_id IS NULL;
        """).fetchone()
        orphan_orders = res[0] if res else 0
        rules_results.append(DQRuleResult(
            rule_id="DQ-005",
            rule_name="Foreign Key Referential Integrity",
            category="INTEGRITY",
            severity="CRITICAL",
            status="PASSED" if orphan_orders == 0 else "FAILED",
            table_name="orders -> customers",
            records_checked=total_orders,
            failed_records_count=orphan_orders,
            failure_rate_pct=round((orphan_orders / max(1, total_orders)) * 100.0, 4),
            description="Verifies all order records reference a valid customer entity",
            sample_failures=[]
        ))

        # -------------------------------------------------------------
        # Rule 6: Logical SLA Breach Consistency
        # -------------------------------------------------------------
        res = conn.execute("""
            SELECT COUNT(*) FROM orders
            WHERE order_status = 'DELIVERED'
              AND actual_delivery_date IS NOT NULL
              AND ((CAST(actual_delivery_date AS TIMESTAMP) > CAST(promised_delivery_date AS TIMESTAMP) AND NOT is_sla_breached)
               OR  (CAST(actual_delivery_date AS TIMESTAMP) <= CAST(promised_delivery_date AS TIMESTAMP) AND is_sla_breached));
        """).fetchone()
        sla_inconsistencies = res[0] if res else 0
        rules_results.append(DQRuleResult(
            rule_id="DQ-006",
            rule_name="SLA Breach Flag Consistency",
            category="CONSISTENCY",
            severity="WARNING",
            status="PASSED" if sla_inconsistencies == 0 else "FAILED",
            table_name="orders",
            records_checked=total_orders,
            failed_records_count=sla_inconsistencies,
            failure_rate_pct=round((sla_inconsistencies / max(1, total_orders)) * 100.0, 4),
            description="Checks that is_sla_breached aligns strictly with delivered vs promised delivery timestamps",
            sample_failures=[]
        ))

        # -------------------------------------------------------------
        # Rule 7: Warehouse Utilization Bounds
        # -------------------------------------------------------------
        res = conn.execute("""
            SELECT COUNT(*) FROM fct_warehouse_performance
            WHERE utilization_rate < 0.0 OR utilization_rate > 1.0;
        """).fetchone()
        invalid_util = res[0] if res else 0
        total_wh_rows = conn.execute("SELECT COUNT(*) FROM fct_warehouse_performance").fetchone()[0]
        rules_results.append(DQRuleResult(
            rule_id="DQ-007",
            rule_name="Warehouse Utilization Rate Bounds",
            category="VALIDITY",
            severity="WARNING",
            status="PASSED" if invalid_util == 0 else "FAILED",
            table_name="fct_warehouse_performance",
            records_checked=total_wh_rows,
            failed_records_count=invalid_util,
            failure_rate_pct=round((invalid_util / max(1, total_wh_rows)) * 100.0, 4),
            description="Ensures computed warehouse utilization rates fall strictly within [0.0, 1.0]",
            sample_failures=[]
        ))

        # -------------------------------------------------------------
        # Rule 8: Valid Order Status Transitions
        # -------------------------------------------------------------
        res = conn.execute("""
            SELECT COUNT(*) FROM orders
            WHERE order_status NOT IN ('ORDER_CREATED', 'PAYMENT_CONFIRMED', 'ORDER_PACKED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'PAYMENT_FAILED', 'RETURN_CREATED');
        """).fetchone()
        invalid_statuses = res[0] if res else 0
        rules_results.append(DQRuleResult(
            rule_id="DQ-008",
            rule_name="Valid Operational Status State Machine",
            category="CONFORMANCE",
            severity="CRITICAL",
            status="PASSED" if invalid_statuses == 0 else "FAILED",
            table_name="orders",
            records_checked=total_orders,
            failed_records_count=invalid_statuses,
            failure_rate_pct=round((invalid_statuses / max(1, total_orders)) * 100.0, 4),
            description="Validates that order status is within the permitted state machine vocabulary",
            sample_failures=[]
        ))

        # Summary Metrics
        total_checks = len(rules_results)
        passed_checks = sum(1 for r in rules_results if r.status == "PASSED")
        failed_checks = total_checks - passed_checks
        critical_issues = sum(1 for r in rules_results if r.status == "FAILED" and r.severity == "CRITICAL")
        warnings = sum(1 for r in rules_results if r.status == "FAILED" and r.severity == "WARNING")

        # Score calculation: 100 - weighted failure penalty
        penalty = (critical_issues * 10.0) + (warnings * 2.5)
        dq_score = max(0.0, min(100.0, round(100.0 - penalty, 1)))

        log_id = f"DQ_AUDIT_{uuid.uuid4().hex[:8].upper()}"
        audit_date = datetime.datetime.now().strftime("%Y-%m-%d")

        report = DQReport(
            log_id=log_id,
            audit_date=audit_date,
            total_checks=total_checks,
            passed_checks=passed_checks,
            failed_checks=failed_checks,
            dq_score_pct=dq_score,
            critical_issues_count=critical_issues,
            warnings_count=warnings,
            rules_results=rules_results
        )

        # Persist audit record in dq_audit_log
        try:
            conn.execute("""
                INSERT INTO dq_audit_log (log_id, audit_date, total_checks, passed_checks, failed_checks, dq_score_pct, critical_issues_count, warnings_count, details_json)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, (
                log_id, audit_date, total_checks, passed_checks, failed_checks,
                dq_score, critical_issues, warnings,
                json.dumps([asdict(r) for r in rules_results])
            ))
        except Exception as e:
            logger.error(f"Failed to log DQ audit: {e}")

        logger.info(f"Data Quality validation complete: DQ Score = {dq_score}% (Passed {passed_checks}/{total_checks})")
        return report


dq_framework = DataQualityFramework()
