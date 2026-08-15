"use client";

import React, { useEffect, useState } from "react";
import { GitFork, ArrowDownRight, Warehouse, Truck, MapPin, Sliders, Sparkles } from "lucide-react";
import Link from "next/link";
import { api } from "../../lib/api";
import { RootCauseData } from "../../lib/types";

export default function RootCausePage() {
  const [rca, setRca] = useState<RootCauseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRootCauses()
      .then((res) => setRca(res.data))
      .catch((err) => console.error("Error fetching RCA data:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <GitFork className="w-6 h-6 text-blue-500" />
            <span>Root Cause Analysis & Attribution Explorer</span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Multi-dimensional mathematical decomposition of operational KPI degradation across stages, facilities, carriers, and regions.
          </p>
        </div>

        <Link
          href="/simulations"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/25 transition-all self-start sm:self-auto"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Launch Simulation Lab</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-600 dark:text-slate-400 text-sm">
          Computing multi-stage attribution models...
        </div>
      ) : rca ? (
        <div className="space-y-6">
          
          {/* Primary Incident Verdict Card */}
          <div className="p-5 rounded-xl border border-blue-800/80 bg-blue-950/20 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider">
                Autonomous Root-Cause Synthesis
              </h2>
            </div>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
              {rca.primary_verdict}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-2 border-t border-blue-900/60">
              <span className="text-slate-600 dark:text-slate-400">Baseline OTD: <strong className="text-slate-800 dark:text-slate-200">{rca.baseline_otd_pct}%</strong></span>
              <span className="text-slate-600 dark:text-slate-400">Incident OTD: <strong className="text-rose-600 dark:text-rose-400">{rca.incident_otd_pct}%</strong></span>
              <span className="text-slate-600 dark:text-slate-400">Net Drop: <strong className="text-rose-600 dark:text-rose-400">{rca.net_drop_pct}%</strong></span>
              <span className="text-slate-600 dark:text-slate-400">GMV At Risk: <strong className="text-amber-600 dark:text-amber-400">₹{rca.total_gmv_at_risk.toLocaleString()}</strong></span>
            </div>
          </div>

          {/* Stage Contribution Waterfall */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]/90 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider">
              Contribution by Fulfillment Stage
            </h3>

            <div className="space-y-3">
              {rca.stage_breakdown.map((st, idx) => (
                <div key={idx} className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{st.stage}</span>
                      <span className={st.severity === "CRITICAL" ? "badge-critical" : "badge-warning"}>
                        {st.contribution_pct}% contribution
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      {st.breach_count} breached orders • ₹{st.gmv_impact.toLocaleString()} GMV impact
                    </div>
                  </div>

                  <div className="w-full sm:w-48 bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden shrink-0">
                    <div
                      className={`h-full rounded-full ${
                        st.severity === "CRITICAL" ? "bg-rose-500" : "bg-amber-500"
                      }`}
                      style={{ width: `${st.contribution_pct}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Node Breakdowns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Warehouses Attribution */}
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]/90 space-y-3">
              <div className="flex items-center gap-2">
                <Warehouse className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono">Fulfillment Hubs Ranked by Breaches</h3>
              </div>
              <div className="space-y-2">
                {rca.top_affected_warehouses.map((w) => (
                  <div key={w.warehouse_id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">{w.code} ({w.warehouse_name})</div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                        {w.breach_count} breaches • Breach Rate: {w.breach_rate}% • GMV: ₹{w.gmv_at_risk.toLocaleString()}
                      </div>
                    </div>
                    <span className="badge-critical">{w.share_of_total_breaches}% of total</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Carriers Attribution */}
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]/90 space-y-3">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono">Carriers Ranked by Delay Impact</h3>
              </div>
              <div className="space-y-2">
                {rca.top_affected_carriers.map((c) => (
                  <div key={c.carrier_id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">{c.carrier_name}</div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                        {c.delayed_shipments} delayed shipments • Delay Rate: {c.delay_rate}%
                      </div>
                    </div>
                    <span className="badge-warning">{c.share_of_delays}% of delays</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      ) : null}

    </div>
  );
}
