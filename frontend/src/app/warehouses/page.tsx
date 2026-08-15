"use client";

import React, { useEffect, useState } from "react";
import { Warehouse as WarehouseIcon, AlertTriangle, CheckCircle2, TrendingUp, Sliders } from "lucide-react";
import Link from "next/link";
import { api } from "../../lib/api";
import { WarehouseScorecard } from "../../lib/types";

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<WarehouseScorecard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getWarehouses()
      .then((res) => setWarehouses(res.data))
      .catch((err) => console.error("Error fetching warehouses:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
            <WarehouseIcon className="w-6 h-6 text-blue-500" />
            <span>Fulfillment Centers & Warehouse Analytics</span>
          </h1>
          <p className="text-xs text-neutral-600 dark:text-slate-400">
            Capacity saturation, packing latency curves, sorting throughput, and backlog tracking across all fulfillment nodes.
          </p>
        </div>

        <Link
          href="/simulations"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/25 transition-all self-start sm:self-auto"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Simulate Volume Shift</span>
        </Link>
      </div>

      {/* Warehouse Utilization Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-neutral-600 dark:text-slate-400 text-sm">
            Loading warehouse network telemetry...
          </div>
        ) : (
          warehouses.map((wh) => {
            const isCritical = wh.avg_utilization_pct > 85.0;
            const isWarning = wh.avg_utilization_pct > 75.0 && !isCritical;

            return (
              <div
                key={wh.warehouse_id}
                className={`p-5 rounded-xl border flex flex-col justify-between space-y-4 transition-all ${
                  isCritical
                    ? "border-rose-800 bg-rose-950/20 shadow-lg shadow-rose-950/20"
                    : isWarning
                    ? "border-amber-800 bg-amber-950/15"
                    : "border-neutral-200 dark:border-slate-800 bg-white dark:bg-[#111827]/90"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-neutral-900 dark:text-white font-mono">{wh.code}</span>
                      <span
                        className={
                          isCritical
                            ? "badge-critical"
                            : isWarning
                            ? "badge-warning"
                            : "badge-success"
                        }
                      >
                        {isCritical ? "CRITICAL CONGESTION" : isWarning ? "ELEVATED" : "OPTIMAL"}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-700 dark:text-slate-300 font-medium mt-0.5">{wh.warehouse_name}</div>
                    <div className="text-[11px] text-neutral-600 dark:text-slate-400 font-mono">{wh.city}, {wh.state}</div>
                  </div>
                </div>

                {/* Utilization Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-neutral-600 dark:text-slate-400">Utilization Rate</span>
                    <span className={`font-bold ${isCritical ? "text-rose-400" : "text-neutral-900 dark:text-white"}`}>
                      {wh.avg_utilization_pct}%
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isCritical ? "bg-rose-500" : isWarning ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(100, wh.avg_utilization_pct)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-neutral-600 dark:text-slate-400 font-mono">
                    <span>Capacity: {wh.capacity_orders_per_day.toLocaleString()} / day</span>
                    <span>Max Safe: 85%</span>
                  </div>
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-neutral-200 dark:border-slate-800">
                  <div className="p-2 rounded bg-neutral-50 dark:bg-slate-900/80 border border-neutral-200 dark:border-slate-800">
                    <span className="text-neutral-600 dark:text-slate-400 text-[10px]">Avg Packing Time</span>
                    <div className="text-sm font-bold text-neutral-800 dark:text-slate-200 mt-0.5">{wh.avg_packing_hours} hrs</div>
                  </div>
                  <div className="p-2 rounded bg-neutral-50 dark:bg-slate-900/80 border border-neutral-200 dark:border-slate-800">
                    <span className="text-neutral-600 dark:text-slate-400 text-[10px]">SLA Breach Rate</span>
                    <div className={`text-sm font-bold mt-0.5 ${wh.avg_sla_breach_rate > 10 ? "text-rose-400" : "text-neutral-800 dark:text-slate-200"}`}>
                      {wh.avg_sla_breach_rate}%
                    </div>
                  </div>
                  <div className="p-2 rounded bg-neutral-50 dark:bg-slate-900/80 border border-neutral-200 dark:border-slate-800">
                    <span className="text-neutral-600 dark:text-slate-400 text-[10px]">Assigned Orders</span>
                    <div className="text-sm font-bold text-neutral-800 dark:text-slate-200 mt-0.5">{wh.total_orders_assigned.toLocaleString()}</div>
                  </div>
                  <div className="p-2 rounded bg-neutral-50 dark:bg-slate-900/80 border border-neutral-200 dark:border-slate-800">
                    <span className="text-neutral-600 dark:text-slate-400 text-[10px]">Active Backlog</span>
                    <div className="text-sm font-bold text-amber-400 mt-0.5">{wh.current_backlog} units</div>
                  </div>
                </div>

                {isCritical && (
                  <div className="p-2.5 rounded bg-rose-950/40 border border-rose-900/70 text-[11px] text-rose-300 flex items-center justify-between">
                    <span>Bottleneck detected: Exceeds sorting conveyor threshold</span>
                    <Link href="/simulations" className="underline font-mono font-bold text-neutral-900 dark:text-white hover:text-rose-200">
                      Reallocate
                    </Link>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
