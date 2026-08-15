"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles, ArrowRight, TrendingDown, AlertTriangle, Sliders,
  Warehouse, Truck, CreditCard, CheckCircle2, FileCode2
} from "lucide-react";
import { MetricCard } from "../components/MetricCard";
import { ExplainModal } from "../components/ExplainModal";
import { usePersona } from "../components/PersonaSwitcher";
import { api } from "../lib/api";
import { ExecutiveSummary, KPITimeseriesItem } from "../lib/types";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";

export default function ExecutiveOverviewPage() {
  const { persona } = usePersona();
  const [summary, setSummary] = useState<ExecutiveSummary | null>(null);
  const [timeseries, setTimeseries] = useState<KPITimeseriesItem[]>([]);
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshDashboard = async () => {
    setLoading(true);
    try {
      // Generate only a bounded batch when a real dashboard refresh occurs.
      await api.generateLiveEvents();
      const res = await api.getKPIs(30);
      setSummary(res.summary);
      setTimeseries(res.timeseries);
    } catch (err) {
      console.error("Error loading live OpsPulse data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshDashboard();
    const interval = window.setInterval(refreshDashboard, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn">
      <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#090d16] p-6 lg:p-8">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-950/80 border border-blue-800/80 text-blue-400 text-xs font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Operational Intelligence & Decision Support Platform</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-mono">OpsPulse <span className="text-blue-500 font-sans">AI</span></h1>
          <p className="text-sm lg:text-base text-slate-300 leading-relaxed font-sans">Understand <strong>WHAT</strong> happened across millions of orders. Discover <strong>WHY</strong> with mathematical root-cause attribution. Predict <strong>WHAT HAPPENS NEXT</strong> with ML risk models. Take tactical <strong>ACTION</strong> with What-If simulations and sandboxed AI tool calling.</p>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button onClick={() => setIsWhyModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/25 transition-all"><Sparkles className="w-3.5 h-3.5" /><span>Diagnose OTD Drop ("WHY?")</span></button>
            <Link href="/ai-analyst" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:border-slate-600 text-xs font-medium transition-colors"><span>Ask AI Analyst</span><ArrowRight className="w-3.5 h-3.5" /></Link>
            <Link href="/simulations" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:border-slate-600 text-xs font-medium transition-colors"><Sliders className="w-3.5 h-3.5 text-indigo-400" /><span>Run Volume Simulation</span></Link>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold font-mono tracking-tight text-white flex items-center gap-2"><span>Executive Operational Pulse</span><span className="text-xs font-mono font-normal text-slate-400">({persona.replace("_", " ")})</span></h2>
          <span className="text-xs font-mono text-slate-400">{loading ? "Refreshing live data…" : `Live • Updated ${new Date().toLocaleTimeString()}`}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Orders Today" value={summary?.orders_today ?? 0} delta={18.4} deltaLabel="surge volume" subtitle={`GMV: ₹${((summary?.gmv_today ?? 0) / 100000).toFixed(1)} Lakhs`} />
          <MetricCard title="On-Time Delivery (OTD)" value={summary?.on_time_delivery_rate ?? 0} suffix="%" delta={summary?.on_time_delivery_delta ?? 0} isPositiveGood={true} hasWhyButton={true} onWhyClick={() => setIsWhyModalOpen(true)} severity="critical" subtitle="Target: 95.0% • Breach alert active" />
          <MetricCard title="GMV At Risk" value={`₹${((summary?.gmv_at_risk ?? 0) / 10000000).toFixed(2)} Cr`} delta={summary?.gmv_at_risk_delta_pct ?? 0} isPositiveGood={false} severity="critical" subtitle="Current operational exposure" />
          <MetricCard title="Payment Failure Rate" value={summary?.payment_failure_rate ?? 0} suffix="%" delta={summary?.payment_failure_delta ?? 0} isPositiveGood={false} severity="warning" subtitle="Live gateway signal" />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-xl border border-slate-800 bg-[#111827]/90 space-y-4">
          <div className="flex items-center justify-between"><div className="space-y-0.5"><h3 className="text-sm font-bold text-white font-mono">On-Time Delivery Rate & SLA Breach Trend (30 Days)</h3><p className="text-xs text-slate-400">Live operational trend with bounded synthetic traffic.</p></div><div className="flex items-center gap-3 text-xs font-mono"><div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span><span className="text-slate-300">OTD %</span></div><div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span><span className="text-slate-300">SLA Breach %</span></div></div></div>
          <div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={timeseries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}><defs><linearGradient id="otdGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/></linearGradient><linearGradient id="breachGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false}/><XAxis dataKey="kpi_date" stroke="#64748b" tick={{fontSize:11}}/><YAxis stroke="#64748b" domain={[70,100]} tick={{fontSize:11}}/><Tooltip contentStyle={{backgroundColor:"#0f172a",borderColor:"#334155",borderRadius:8,fontSize:12}}/><Area type="monotone" dataKey="on_time_delivery_rate" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#otdGradient)" name="OTD Rate %"/><Area type="monotone" dataKey="sla_breach_rate" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#breachGradient)" name="Breach Rate %"/></AreaChart></ResponsiveContainer></div>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-[#111827]/90 space-y-4 flex flex-col justify-between"><div className="space-y-1"><h3 className="text-sm font-bold text-white font-mono">Fulfillment Latency Breakdown</h3><p className="text-xs text-slate-400">Average duration per operational stage.</p></div><div className="space-y-3"><div className="space-y-1"><div className="flex justify-between text-xs font-mono"><span className="text-slate-300">Warehouse Packing</span><span className="text-rose-400 font-bold">{summary?.avg_warehouse_hours ?? 0} hrs</span></div><div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden"><div className="bg-rose-500 h-full rounded-full" style={{width:"70%"}}></div></div></div><div className="space-y-1"><div className="flex justify-between text-xs font-mono"><span className="text-slate-300">Carrier Dock Pickup Lag</span><span className="text-amber-400 font-bold">{summary?.avg_carrier_pickup_delay_hours ?? 0} hrs</span></div><div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden"><div className="bg-amber-500 h-full rounded-full" style={{width:"45%"}}></div></div></div><div className="space-y-1"><div className="flex justify-between text-xs font-mono"><span className="text-slate-300">Linehaul Transit</span><span className="text-blue-400 font-bold">{summary?.avg_transit_hours ?? 0} hrs</span></div><div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden"><div className="bg-blue-500 h-full rounded-full" style={{width:"85%"}}></div></div></div></div><div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs"><span className="text-slate-400 font-mono">Total Order-to-Door</span><span className="text-white font-mono font-bold">{summary?.avg_fulfillment_hours ?? 0} hrs</span></div></div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className="p-5 rounded-xl border border-rose-900/60 bg-rose-950/10 space-y-4"><div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-rose-400"/><h3 className="text-sm font-bold text-white font-mono">Top Operational Issues Today</h3></div><div className="space-y-3">{summary?.top_issues?.map((issue) => <div key={issue.id} className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1.5"><div className="flex items-center justify-between"><span className="text-xs font-bold text-white">{issue.title}</span><span className={issue.severity === "CRITICAL" ? "badge-critical" : "badge-warning"}>{issue.severity}</span></div><p className="text-xs text-slate-300">{issue.description}</p><div className="text-[11px] font-mono text-rose-300">Impact: {issue.impact}</div></div>)}</div></div><div className="p-5 rounded-xl border border-blue-900/60 bg-blue-950/10 space-y-4 flex flex-col justify-between"><div className="space-y-4"><div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-blue-400"/><h3 className="text-sm font-bold text-white font-mono">Autonomous Decision Support Actions</h3></div><div className="space-y-3">{summary?.recommended_actions?.map((act) => <div key={act.id} className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-2"><div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-200">{act.title}</span><span className="badge-info font-mono">{Math.round(act.confidence * 100)}% Confidence</span></div><p className="text-xs text-emerald-400 font-mono">Expected Benefit: {act.expected_impact}</p></div>)}</div></div><Link href="/simulations" className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold hover:brightness-110 shadow-lg shadow-blue-500/20 transition-all mt-4"><Sliders className="w-4 h-4"/><span>Launch What-If Simulation Engine</span></Link></div></section>

      <ExplainModal isOpen={isWhyModalOpen} onClose={() => setIsWhyModalOpen(false)} />
    </div>
  );
}
