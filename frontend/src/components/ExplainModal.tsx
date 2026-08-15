"use client";

import React, { useEffect, useState } from "react";
import { X, Sparkles, AlertTriangle, ArrowDownRight, Warehouse, Truck, MapPin, Sliders } from "lucide-react";
import Link from "next/link";
import { api } from "../lib/api";
import { RootCauseData } from "../lib/types";

interface ExplainModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExplainModal: React.FC<ExplainModalProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<RootCauseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.getRootCauses()
        .then((res) => setData(res.data))
        .catch((err) => console.error("Failed to fetch root causes:", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-950/80 border border-blue-800/80 text-blue-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                Explainability Breakdown: <span className="text-rose-500 dark:text-rose-400">On-Time Delivery Decline</span>
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Multi-dimensional attribution analysis decomposing the 5.1% SLA drop across stages and nodes.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
            Decomposing root cause attributions across 10M+ events...
          </div>
        ) : data ? (
          <div className="space-y-6">
            
            {/* Headline Metric Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400">Baseline OTD</span>
                <div className="text-xl font-bold text-slate-900 dark:text-slate-200 font-mono mt-1">
                  {data.baseline_otd_pct}%
                </div>
                <span className="text-[11px] text-slate-400">Normal 21-day average</span>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/70">
                <span className="text-xs text-rose-300">Incident OTD</span>
                <div className="text-xl font-bold text-rose-400 font-mono mt-1">
                  {data.incident_otd_pct}%
                </div>
                <span className="text-[11px] text-rose-400 font-mono font-medium flex items-center gap-0.5">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  {data.net_drop_pct}% absolute decline
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400">GMV At Risk</span>
                <div className="text-xl font-bold text-amber-600 dark:text-amber-400 font-mono mt-1">
                  ₹{data.total_gmv_at_risk.toLocaleString()}
                </div>
                <span className="text-[11px] text-slate-400">{data.total_breached_orders} breached shipments</span>
              </div>
            </div>

            {/* Primary Verdict Banner */}
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 space-y-1">
              <span className="text-[11px] uppercase font-mono tracking-wider text-blue-600 dark:text-blue-400 font-semibold">
                Autonomous Root-Cause Verdict
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                {data.primary_verdict}
              </p>
            </div>

            {/* Stage Breakdown Waterfall */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                Stage Contribution to Total Breaches
              </h3>
              <div className="space-y-2">
                {data.stage_breakdown.map((st, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-200">{st.stage}</span>
                        <span className={st.severity === "CRITICAL" ? "badge-critical" : st.severity === "HIGH" ? "badge-warning" : "badge-neutral"}>
                          {st.contribution_pct}% share
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {st.breach_count} affected orders • ₹{st.gmv_impact.toLocaleString()} GMV impact
                      </p>
                    </div>

                    <div className="w-32 bg-slate-800 rounded-full h-2 overflow-hidden hidden sm:block">
                      <div
                        className={`h-full rounded-full ${
                          st.severity === "CRITICAL" ? "bg-rose-500" : st.severity === "HIGH" ? "bg-amber-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${st.contribution_pct}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Node Attributions (Warehouses & Carriers) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Top Affected Warehouses */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 dark:text-slate-400 font-semibold uppercase">
                  <Warehouse className="w-3.5 h-3.5 text-blue-400" />
                  <span>Top Affected Fulfillment Hubs</span>
                </div>
                <div className="space-y-1.5">
                  {data.top_affected_warehouses.slice(0, 3).map((w) => (
                    <div key={w.warehouse_id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-200">{w.code} ({w.warehouse_name})</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{w.breach_count} breaches ({w.breach_rate}% breach rate)</div>
                      </div>
                      <span className="font-mono text-rose-400 font-semibold">{w.share_of_total_breaches}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Affected Carriers */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 dark:text-slate-400 font-semibold uppercase">
                  <Truck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Top Delayed 3PL Carriers</span>
                </div>
                <div className="space-y-1.5">
                  {data.top_affected_carriers.slice(0, 3).map((c) => (
                    <div key={c.carrier_id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-200">{c.carrier_name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{c.delayed_shipments} delayed shipments ({c.delay_rate}% delay rate)</div>
                      </div>
                      <span className="font-mono text-amber-400 font-semibold">{c.share_of_delays}%</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400">Ready to test tactical resolution?</span>
              <div className="flex items-center gap-2">
                <Link
                  href="/simulations"
                  onClick={onClose}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold hover:brightness-110 shadow-md shadow-blue-500/20 transition-all"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Run What-If Simulation Lab</span>
                </Link>
              </div>
            </div>

          </div>
        ) : null}

      </div>
    </div>
  );
};
