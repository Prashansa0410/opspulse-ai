"""Multi-variate and Rolling Baseline Anomaly Detection Engine for OpsPulse AI."""
import datetime
import logging
import uuid
from typing import Any
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from backend.app.config import settings
from backend.app.db.session import db_manager

logger = logging.getLogger("opspulse.ml.anomalies")


class AnomalyDetector:
    """Detects statistical deviations across operational time series and processes."""

    def __init__(self, db=db_manager):
        self.db = db

    def detect_all_anomalies(self) -> list[dict[str, Any]]:
        """Run anomaly detection across all critical operational metrics and persist to database."""
        logger.info("Running operational anomaly detection algorithms...")
        conn = self.db.get_connection()
        anomalies: list[dict[str, Any]] = []

        # -------------------------------------------------------------
        # 1. Payment Provider Failure Rate Anomaly
        # -------------------------------------------------------------
        pay_df = pd.DataFrame(conn.execute("""
            SELECT
                strftime('%Y-%m-%d', CAST(created_at AS TIMESTAMP)) AS pay_date,
                provider,
                COUNT(*) AS total_txns,
                COUNT(CASE WHEN status = 'FAILED' THEN 1 END) AS failed_txns,
                ROUND((COUNT(CASE WHEN status = 'FAILED' THEN 1 END) * 1.0 / COUNT(*)) * 100.0, 2) AS failure_rate
            FROM payments
            GROUP BY 1, 2
            ORDER BY 1 ASC;
        """).fetchall(), columns=["pay_date", "provider", "total_txns", "failed_txns", "failure_rate"])

        if not pay_df.empty:
            for provider, group in pay_df.groupby("provider"):
                rates = group["failure_rate"].values
                mean = np.mean(rates)
                std = max(0.1, np.std(rates))
                max_rate = float(np.max(rates))
                latest_rate = rates[-1]
                z = float((max_rate - mean) / std)

                if max_rate > 5.0 or z >= 1.8:
                    anomalies.append({
                        "anomaly_id": f"ANOM_PAY_{uuid.uuid4().hex[:6].upper()}",
                        "detected_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                        "metric_name": "Payment Gateway Failure Rate Spike",
                        "entity_type": "PAYMENT_PROVIDER",
                        "entity_id": provider,
                        "entity_name": f"{provider} Gateway",
                        "severity": "CRITICAL" if max_rate > 10.0 or z >= 2.5 else "WARNING",
                        "expected_value": round(float(mean), 2),
                        "actual_value": round(float(max_rate), 2),
                        "deviation_percent": round(float(((max_rate - mean) / max(0.1, mean)) * 100.0), 1),
                        "z_score": round(float(z), 2),
                        "summary": f"{provider} failure rate spiked to {max_rate}% (Baseline: {mean:.1f}%, Z-Score: {z:.1f})",
                        "root_cause_hint": "Gateway timeout errors / API latency on acquiring bank upstream",
                        "is_active": True
                    })

        # -------------------------------------------------------------
        # 2. Warehouse Packing Duration & Saturation Anomaly
        # -------------------------------------------------------------
        wh_df = pd.DataFrame(conn.execute("""
            SELECT
                kpi_date,
                warehouse_id,
                warehouse_name,
                utilization_rate,
                avg_packing_time_hours
            FROM fct_warehouse_performance
            ORDER BY kpi_date ASC;
        """).fetchall(), columns=["kpi_date", "warehouse_id", "warehouse_name", "utilization_rate", "avg_packing_time_hours"])

        if not wh_df.empty:
            for wh_id, group in wh_df.groupby("warehouse_id"):
                wh_name = group["warehouse_name"].iloc[0]
                pack_times = group["avg_packing_time_hours"].values
                utils = group["utilization_rate"].values

                mean_pack = np.mean(pack_times)
                std_pack = max(0.2, np.std(pack_times))
                max_pack = float(np.max(pack_times))
                max_util = float(np.max(utils))
                z_pack = float((max_pack - mean_pack) / std_pack)

                if max_util > 0.80 or max_pack > 5.0 or z_pack >= 1.8:
                    anomalies.append({
                        "anomaly_id": f"ANOM_WH_{uuid.uuid4().hex[:6].upper()}",
                        "detected_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                        "metric_name": "Warehouse Capacity Saturation & Packing Delay",
                        "entity_type": "WAREHOUSE",
                        "entity_id": wh_id,
                        "entity_name": wh_name,
                        "severity": "CRITICAL" if max_util > 0.90 else "WARNING",
                        "expected_value": round(float(mean_pack), 2),
                        "actual_value": round(float(max_pack), 2),
                        "deviation_percent": round(float(((max_pack - mean_pack) / max(0.1, mean_pack)) * 100.0), 1),
                        "z_score": round(float(z_pack), 2),
                        "summary": f"{wh_name} packing time escalated to {max_pack:.1f}h (Utilization: {max_util*100:.1f}%)",
                        "root_cause_hint": "Order intake volume exceeded sorting conveyor and packing station throughput",
                        "is_active": True
                    })

        # -------------------------------------------------------------
        # 3. Carrier Pickup Delay Anomaly
        # -------------------------------------------------------------
        car_df = pd.DataFrame(conn.execute("""
            SELECT
                kpi_date,
                carrier_id,
                carrier_name,
                avg_pickup_delay_hours,
                on_time_rate
            FROM fct_carrier_performance
            ORDER BY kpi_date ASC;
        """).fetchall(), columns=["kpi_date", "carrier_id", "carrier_name", "avg_pickup_delay_hours", "on_time_rate"])

        if not car_df.empty:
            for car_id, group in car_df.groupby("carrier_id"):
                car_name = group["carrier_name"].iloc[0]
                pickups = group["avg_pickup_delay_hours"].values
                mean_p = np.mean(pickups)
                std_p = max(0.2, np.std(pickups))
                max_p = float(np.max(pickups))
                z_p = float((max_p - mean_p) / std_p)

                if max_p > 4.5 or z_p >= 1.8:
                    anomalies.append({
                        "anomaly_id": f"ANOM_CAR_{uuid.uuid4().hex[:6].upper()}",
                        "detected_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                        "metric_name": "Carrier Dock Handoff Delay",
                        "entity_type": "CARRIER",
                        "entity_id": car_id,
                        "entity_name": car_name,
                        "severity": "CRITICAL" if max_p > 7.0 else "WARNING",
                        "expected_value": round(float(mean_p), 2),
                        "actual_value": round(float(max_p), 2),
                        "deviation_percent": round(float(((max_p - mean_p) / max(0.1, mean_p)) * 100.0), 1),
                        "z_score": round(float(z_p), 2),
                        "summary": f"{car_name} pickup delay reached {max_p:.1f}h (Baseline: {mean_p:.1f}h)",
                        "root_cause_hint": "Truck availability deficit and linehaul dispatch bottleneck",
                        "is_active": True
                    })

        # Persist detected anomalies into fct_anomaly_events table
        conn.execute("DELETE FROM fct_anomaly_events;")
        for anom in anomalies:
            conn.execute("""
                INSERT INTO fct_anomaly_events (
                    anomaly_id, detected_at, metric_name, entity_type, entity_id,
                    entity_name, severity, expected_value, actual_value,
                    deviation_percent, z_score, summary, root_cause_hint, is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, (
                anom["anomaly_id"], anom["detected_at"], anom["metric_name"],
                anom["entity_type"], anom["entity_id"], anom["entity_name"],
                anom["severity"], anom["expected_value"], anom["actual_value"],
                anom["deviation_percent"], anom["z_score"], anom["summary"],
                anom["root_cause_hint"], anom["is_active"]
            ))

        logger.info(f"Detected and persisted {len(anomalies)} operational anomalies.")
        return anomalies

    def get_active_anomalies(self) -> list[dict[str, Any]]:
        """Retrieve current active anomalies."""
        conn = self.db.get_connection()
        rows = conn.execute("""
            SELECT * FROM fct_anomaly_events
            WHERE is_active = TRUE
            ORDER BY z_score DESC;
        """).fetchall()
        cols = [desc[0] for desc in conn.description]
        return [dict(zip(cols, r)) for r in rows]


anomaly_detector = AnomalyDetector()
