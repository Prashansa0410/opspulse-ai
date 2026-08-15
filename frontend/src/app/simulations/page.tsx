"use client";

import React, { useState } from "react";
import { Sliders, Play, CheckCircle2, ArrowRight, ShieldAlert, Sparkles, TrendingUp, AlertTriangle } from "lucide-react";
import { api } from "../../lib/api";
import { SimulationResult } from "../../lib/types";

export default function SimulationsPage() {
  const [sourceWh, setSourceWh] = useState("WH_BLR_01");
  const [targetWh, setTargetWh] = useState("WH_BLR_02");
  const [volumeShift, setVolumeShift] = useState(18);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const res = await api.runSimulation({
        title: `Reallocate ${volumeShift}% Weekend Volume: BLR-01 -> BLR-02`,
        source_warehouse_id: sourceWh,
        target_warehouse_id: targetWh,
        volume_shift_pct: volumeShift,
      });
      setResult(res);
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Sliders className="w-6 h-6 text-indigo-400" />
          <span>Decision Support & What-If Simulation Lab</span>
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Simulate operational interventions before executing in production: reallocate volume, relieve fulfillment bottlenecks, predict On-Time Delivery lift, and quantify secured GMV.
        </p>
      </div>

      {/* Interactive Controls Card */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]/90 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider">
              Intervention Scenario Parameters
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Configure fulfillment network source and destination nodes and volume diversion percentages.
            </p>
          </div>
          <span className="badge-info font-mono">Mathematical Model</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Source Facility */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-700 dark:text-slate-300 font-semibold">
              Source Facility (Overloaded)
            </label>
            <select
              value={sourceWh}
              onChange={(e) => setSourceWh(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg p-2.5 text-xs font-mono outline-none focus:border-blue-500"
            >
              <option value="WH_BLR_01">BLR-01 (Bangalore Mega FC - 94.6% Util)</option>
              <option value="WH_DEL_01">DEL-01 (Delhi North Hub - 72.0% Util)</option>
              <option value="WH_BOM_01">BOM-01 (Mumbai West FC - 70.0% Util)</option>
            </select>
            <span className="text-[11px] text-rose-600 dark:text-rose-400 font-mono">Current: 94.6% Utilization (Alert)</span>
          </div>

          {/* Target Facility */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-700 dark:text-slate-300 font-semibold">
              Target Facility (Headroom)
            </label>
            <select
              value={targetWh}
              onChange={(e) => setTargetWh(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg p-2.5 text-xs font-mono outline-none focus:border-blue-500"
            >
              <option value="WH_BLR_02">BLR-02 (Bangalore South Satellite - 55.2% Util)</option>
              <option value="WH_HYD_01">HYD-01 (Hyderabad Central - 60.0% Util)</option>
              <option value="WH_MAA_01">MAA-01 (Chennai Hub - 58.0% Util)</option>
            </select>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">Headroom: 44.8% Available</span>
          </div>

          {/* Volume Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-700 dark:text-slate-300 font-semibold">Shift Volume Pct</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">{volumeShift}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              step="1"
              value={volumeShift}
              onChange={(e) => setVolumeShift(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400 font-mono">
              <span>Min: 5%</span>
              <span>Max: 40%</span>
            </div>
          </div>

        </div>

        {/* Run Simulation Button */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={handleSimulate}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            <span>{loading ? "Simulating Network Impact..." : "Execute Simulation"}</span>
          </button>
        </div>

      </div>

      {/* Simulation Results Card */}
      {result && (
        <div className="p-6 rounded-2xl border border-emerald-800/80 bg-emerald-950/10 space-y-6 shadow-xl animate-fadeIn">
          
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-mono">{result.title}</h3>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                Simulation completed with <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{(result.confidence_score * 100).toFixed(0)}% model confidence</strong>.
              </p>
            </div>
            <span className="badge-success font-mono">SIMULATION SUCCESS</span>
          </div>

          {/* Before vs After Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Baseline (Before) */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-3 text-xs font-mono">
              <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 pb-2">
                Baseline (Current State)
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Source Util (BLR-01):</span>
                  <span className="text-rose-600 dark:text-rose-400 font-bold">{result.baseline.source_utilization_pct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Target Util (BLR-02):</span>
                  <span className="text-slate-800 dark:text-slate-200">{result.baseline.target_utilization_pct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">System On-Time Delivery:</span>
                  <span className="text-rose-600 dark:text-rose-400 font-bold">{result.baseline.system_on_time_delivery_rate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">GMV At Risk:</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold">₹{result.baseline.gmv_at_risk.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Simulated (After Intervention) */}
            <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-800/80 space-y-3 text-xs font-mono">
              <div className="text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold border-b border-blue-900/60 pb-2">
                Simulated Result (After {volumeShift}% Shift)
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-700 dark:text-slate-300">Source Util (BLR-01):</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{result.simulated.source_utilization_pct}% (Normalized)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-700 dark:text-slate-300">Target Util (BLR-02):</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold">{result.simulated.target_utilization_pct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-700 dark:text-slate-300">Predicted On-Time Delivery:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{result.simulated.system_on_time_delivery_rate}% (+{result.expected_otd_lift}%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-700 dark:text-slate-300">Estimated GMV Secured:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">₹{result.gmv_saved.toLocaleString()}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Assumptions & Operational Risks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300 uppercase text-[11px]">Key Assumptions</span>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-1">
                {result.assumptions.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300 uppercase text-[11px]">Operational Risk Factors</span>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-1">
                {result.risks_notes.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
