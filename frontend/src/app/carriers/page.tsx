"use client";

import React, { useEffect, useState } from "react";
import { Truck, Clock, AlertTriangle, CheckCircle, ArrowUpRight } from "lucide-react";
import { api } from "../../lib/api";
import { CarrierScorecard } from "../../lib/types";

export default function CarriersPage() {
  const [carriers, setCarriers] = useState<CarrierScorecard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCarriers()
      .then((res) => setCarriers(res.data))
      .catch((err) => console.error("Error fetching carriers:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold font-mono tracking-tight text-white flex items-center gap-2">
          <Truck className="w-6 h-6 text-indigo-400" />
          <span>3PL Carrier Analytics & Performance Scorecards</span>
        </h1>
        <p className="text-xs text-slate-400">
          On-Time Delivery compliance, carrier dock pickup lag, linehaul transit latency, and delivery failure rates.
        </p>
      </div>

      {/* Carrier Scorecards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm">
            Loading carrier scorecards...
          </div>
        ) : (
          carriers.map((car) => {
            const isUnderperforming = car.avg_on_time_rate < 92.0;
            const isMonitoring = car.avg_on_time_rate < 95.0 && !isUnderperforming;

            return (
              <div
                key={car.carrier_id}
                className={`p-5 rounded-xl border flex flex-col justify-between space-y-4 transition-all ${
                  isUnderperforming
                    ? "border-rose-800 bg-rose-950/20 shadow-lg shadow-rose-950/20"
                    : isMonitoring
                    ? "border-amber-800 bg-amber-950/15"
                    : "border-slate-800 bg-[#111827]/90"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-white font-mono">{car.carrier_name}</span>
                      <span
                        className={
                          isUnderperforming
                            ? "badge-critical"
                            : isMonitoring
                            ? "badge-warning"
                            : "badge-success"
                        }
                      >
                        {isUnderperforming ? "UNDERPERFORMING" : isMonitoring ? "MONITORING" : "OPTIMAL"}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">{car.service_type} • SLA: {car.base_sla_hours}h</div>
                  </div>
                </div>

                {/* On-Time Rate Metric */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">On-Time Delivery Rate</span>
                    <span className={`font-bold ${isUnderperforming ? "text-rose-400" : "text-emerald-400"}`}>
                      {car.avg_on_time_rate}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isUnderperforming ? "bg-rose-500" : isMonitoring ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(100, car.avg_on_time_rate)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Benchmark: 95.0%</span>
                    <span>Cost: ₹{car.cost_per_kg}/kg</span>
                  </div>
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-800">
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400 text-[10px]">Avg Pickup Lag</span>
                    <div className={`text-sm font-bold mt-0.5 ${car.avg_pickup_delay_hours > 3.5 ? "text-rose-400" : "text-slate-200"}`}>
                      {car.avg_pickup_delay_hours} hrs
                    </div>
                  </div>
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400 text-[10px]">Avg Linehaul Transit</span>
                    <div className="text-sm font-bold text-slate-200 mt-0.5">{car.avg_transit_time_hours} hrs</div>
                  </div>
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400 text-[10px]">Total Shipments</span>
                    <div className="text-sm font-bold text-slate-200 mt-0.5">{car.total_shipments.toLocaleString()}</div>
                  </div>
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400 text-[10px]">Failed Deliveries</span>
                    <div className="text-sm font-bold text-amber-400 mt-0.5">{car.delivery_failed_count}</div>
                  </div>
                </div>

                {isUnderperforming && (
                  <div className="p-2.5 rounded bg-rose-950/40 border border-rose-900/70 text-[11px] text-rose-300">
                    SwiftExpress truck turnaround delay responsible for 34% of active delivery breaches.
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
