"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, ShieldCheck, Activity, ArrowUpRight, Zap, RefreshCw } from "lucide-react";
import { api } from "../../lib/api";
import { AnomalyEvent } from "../../lib/types";

export default function AnomaliesPage() {
  const [anomalies, setAnomalies] = useState<AnomalyEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnomalies = () => {
    setLoading(true);
    api.getAnomalies()
      .then((res) => setAnomalies(res.data))
      .catch((err) => console.error("Error fetching anomalies:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnomalies();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            <span>Anomaly Center & Unsupervised Detection Hub</span>
          </h1>
          <p className="text-xs text-slate-400">
            Real-time statistical anomaly monitoring across payment failure rates, warehouse processing saturation, carrier turnaround delays, and support queues.
          </p>
        </div>

        <button
          onClick={fetchAnomalies}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Re-scan Anomaly Baselines</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-[#111827]/90">
          <span className="text-xs font-mono text-slate-400">Active Anomalies</span>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            {anomalies.length}
          </div>
          <span className="text-[11px] text-slate-400">Evaluated against 7-day rolling baselines</span>
        </div>

        <div className="p-4 rounded-xl border border-rose-900/60 bg-rose-950/20">
          <span className="text-xs font-mono text-rose-300">Critical Incidents</span>
          <div className="text-2xl font-bold text-rose-400 font-mono mt-1">
            {anomalies.filter((a) => a.severity === "CRITICAL").length}
          </div>
          <span className="text-[11px] text-rose-300">Z-Score ≥ 2.5 sigma deviation</span>
        </div>

        <div className="p-4 rounded-xl border border-amber-900/60 bg-amber-950/20">
          <span className="text-xs font-mono text-amber-300">Warning Level</span>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
            {anomalies.filter((a) => a.severity === "WARNING").length}
          </div>
          <span className="text-[11px] text-amber-300">Z-Score 1.8 - 2.4 sigma deviation</span>
        </div>
      </div>

      {/* Anomalies List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
          Detected Statistical Outliers & Process Anomalies
        </h2>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            Scanning multi-variate operational metrics with Isolation Forest...
          </div>
        ) : anomalies.length === 0 ? (
          <div className="p-8 rounded-xl border border-slate-800 bg-[#111827] text-center text-slate-400">
            All operational systems operating within normal 2-sigma thresholds.
          </div>
        ) : (
          <div className="space-y-3">
            {anomalies.map((anom) => (
              <div
                key={anom.anomaly_id}
                className={`p-4 rounded-xl border space-y-3 transition-all ${
                  anom.severity === "CRITICAL"
                    ? "border-rose-800/80 bg-rose-950/25 shadow-md shadow-rose-950/20"
                    : "border-amber-800/70 bg-amber-950/15"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className={anom.severity === "CRITICAL" ? "badge-critical" : "badge-warning"}>
                      {anom.severity}
                    </span>
                    <span className="text-sm font-bold text-white font-mono">{anom.metric_name}</span>
                    <span className="text-xs text-slate-400 font-mono">({anom.entity_name})</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-slate-400">Z-Score: <strong className="text-white font-bold">{anom.z_score}σ</strong></span>
                    <span className="text-slate-400">Deviation: <strong className="text-rose-400">+{anom.deviation_percent}%</strong></span>
                  </div>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {anom.summary}
                </p>

                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-slate-300">
                      <strong>Root Cause Diagnostic:</strong> {anom.root_cause_hint}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 shrink-0">
                    <span>Expected: {anom.expected_value}</span>
                    <span>Actual: <strong className="text-rose-400">{anom.actual_value}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
