"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles, ArrowRight, TrendingDown, AlertTriangle, Sliders,
  Warehouse, Truck, CreditCard, CheckCircle2, FileCode2, Terminal
} from "lucide-react";
import { MetricCard } from "../components/MetricCard";
import { ExplainModal } from "../components/ExplainModal";
import { useAuth } from "../lib/auth";
import { api } from "../lib/api";
import { ExecutiveSummary, KPITimeseriesItem } from "../lib/types";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";

export default function ExecutiveOverviewPage() {
  const { user } = useAuth();
  const roleDisplay = user?.role ? user.role.replace("_", " ") : "Loading...";
  const [summary, setSummary] = useState<ExecutiveSummary | null>(null);
  const [timeseries, setTimeseries] = useState<KPITimeseriesItem[]>([]);
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      // A normal page load/refresh is read-only. It must NOT create new orders.
      const res = await api.getKPIs(30);
      setSummary(res.summary);
      setTimeseries(res.timeseries);
    } catch (err) {
      console.error("Error loading OpsPulse data:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateAndRefresh = async () => {
    setLoading(true);
    try {
      // Live traffic is generated only by the scheduled tick while the dashboard is open.
      await api.generateLiveEvents();
      const res = await api.getKPIs(30);
      setSummary(res.summary);
      setTimeseries(res.timeseries);
    } catch (err) {
      console.error("Error refreshing live OpsPulse data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial page load: generate live events so data is current right away
    generateAndRefresh();

    // Simulate streaming traffic once per minute while the dashboard is open.
    const interval = window.setInterval(generateAndRefresh, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn">
      <section className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-900 bg-white dark:bg-[#0a0a0a] p-6 lg:p-8">
        <div className="relative z-10 max-w-3xl space-y-4">
          <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight font-sans">OpsPulse Operations Core</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-sans max-w-2xl">Monitor system health across fulfillment nodes. Identify root causes of SLA breaches, simulate volume changes, and review AI-generated operational recommendations.</p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button onClick={() => setIsWhyModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"><Sparkles className="w-3.5 h-3.5 text-blue-500" /><span>Diagnose OTD Drop</span></button>
            <Link href="/ai-analyst" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"><Terminal className="w-3.5 h-3.5 text-cyan-500" /><span>Query AI Analyst</span></Link>
            <Link href="/simulations" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"><Sliders className="w-3.5 h-3.5 text-indigo-400" /><span>Volume Simulation</span></Link>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold font-mono tracking-tight text-slate-900 dark:text-white flex items-center gap-2"><span>Executive Operational Pulse</span><span className="text-xs font-mono font-normal text-slate-500 dark:text-slate-400">({roleDisplay})</span></h2>
          <span className="text-xs font-mono text-slate-400">{loading ? "Refreshing live data…" : `Live • Updated ${new Date().toLocaleTimeString()}`}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Orders Today" value={loading && !summary ? "..." : summary?.orders_today ?? 0} delta={18.4} deltaLabel="surge volume" subtitle={`GMV: ₹${((summary?.gmv_today ?? 0) / 100000).toFixed(1)} Lakhs`} />
          <MetricCard title="On-Time Delivery (OTD)" value={loading && !summary ? "..." : summary?.on_time_delivery_rate ?? 0} suffix={loading && !summary ? "" : "%"} delta={summary?.on_time_delivery_delta ?? 0} isPositiveGood={true} hasWhyButton={true} onWhyClick={() => setIsWhyModalOpen(true)} severity="critical" subtitle="Target: 95.0% • Breach alert active" />
          <MetricCard title="GMV At Risk" value={loading && !summary ? "..." : `₹${((summary?.gmv_at_risk ?? 0) / 10000000).toFixed(2)} Cr`} delta={summary?.gmv_at_risk_delta_pct ?? 0} isPositiveGood={false} severity="critical" subtitle="Current operational exposure" />
          <MetricCard title="Payment Failure Rate" value={loading && !summary ? "..." : summary?.payment_failure_rate ?? 0} suffix={loading && !summary ? "" : "%"} delta={summary?.payment_failure_delta ?? 0} isPositiveGood={false} severity="warning" subtitle="Live gateway signal" />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-lg border border-slate-200 dark:border-slate-900 bg-white dark:bg-[#0a0a0a] space-y-5">
          <div className="flex items-center justify-between"><div className="space-y-1"><h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200 font-sans tracking-tight">On-Time Delivery Rate & SLA Breach Trend (30 Days)</h3><p className="text-xs text-slate-500">Live operational trend with bounded synthetic traffic.</p></div><div className="flex items-center gap-4 text-xs font-mono"><div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span><span className="text-slate-600 dark:text-slate-400">OTD %</span></div><div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span><span className="text-slate-600 dark:text-slate-400">SLA Breach %</span></div></div></div>
          <div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={timeseries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}><defs><linearGradient id="otdGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/></linearGradient><linearGradient id="breachGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false}/><XAxis dataKey="kpi_date" stroke="#737373" tick={{fontSize:10, fill:"#737373"}} tickLine={false} axisLine={{stroke: "#262626"}}/><YAxis stroke="#737373" domain={[70,100]} tick={{fontSize:10, fill:"#737373"}} tickLine={false} axisLine={false}/><Tooltip contentStyle={{backgroundColor:"#0a0a0a",borderColor:"#262626",borderRadius:4,fontSize:11,boxShadow:"none",color:"#ededed"}} itemStyle={{color:"#ededed"}}/><Area type="monotone" dataKey="on_time_delivery_rate" stroke="#3b82f6" strokeWidth={1.5} fillOpacity={1} fill="url(#otdGradient)" name="OTD Rate %"/><Area type="monotone" dataKey="sla_breach_rate" stroke="#f43f5e" strokeWidth={1.5} fillOpacity={1} fill="url(#breachGradient)" name="Breach Rate %"/></AreaChart></ResponsiveContainer></div>
        </div>

        <div className="p-6 rounded-lg border border-slate-200 dark:border-slate-900 bg-white dark:bg-[#0a0a0a] space-y-6 flex flex-col justify-between"><div className="space-y-1"><h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200 font-sans tracking-tight">Fulfillment Latency Breakdown</h3><p className="text-xs text-slate-500">Average duration per operational stage.</p></div><div className="space-y-4"><div className="space-y-1.5"><div className="flex justify-between text-xs font-mono"><span className="text-slate-600 dark:text-slate-400">Warehouse Packing</span><span className="text-rose-500 dark:text-rose-400">{summary?.avg_warehouse_hours ?? 0} hrs</span></div><div className="w-full bg-slate-200 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden"><div className="bg-rose-500 h-full rounded-full" style={{width:"70%"}}></div></div></div><div className="space-y-1.5"><div className="flex justify-between text-xs font-mono"><span className="text-slate-600 dark:text-slate-400">Carrier Dock Pickup Lag</span><span className="text-amber-500 dark:text-amber-400">{summary?.avg_carrier_pickup_delay_hours ?? 0} hrs</span></div><div className="w-full bg-slate-200 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden"><div className="bg-amber-500 h-full rounded-full" style={{width:"45%"}}></div></div></div><div className="space-y-1.5"><div className="flex justify-between text-xs font-mono"><span className="text-slate-600 dark:text-slate-400">Linehaul Transit</span><span className="text-blue-500 dark:text-blue-400">{summary?.avg_transit_hours ?? 0} hrs</span></div><div className="w-full bg-slate-200 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden"><div className="bg-blue-500 h-full rounded-full" style={{width:"85%"}}></div></div></div></div><div className="pt-4 border-t border-slate-200 dark:border-slate-900 flex items-center justify-between text-xs"><span className="text-slate-500 font-mono">Total Order-to-Door</span><span className="text-slate-900 dark:text-slate-200 font-mono font-medium">{summary?.avg_fulfillment_hours ?? 0} hrs</span></div></div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className="p-6 rounded-lg border border-slate-200 dark:border-slate-900 bg-white dark:bg-[#0a0a0a] space-y-5"><div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-900 pb-3"><div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-rose-500"/><h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200 tracking-tight">Top Operational Issues Today</h3></div></div><div className="space-y-3">{summary?.top_issues?.map((issue) => <div key={issue.id} className="p-4 rounded border border-slate-100 dark:border-slate-800/50 border-l-2 border-l-rose-500 dark:border-l-rose-500 bg-white dark:bg-slate-900/50 shadow-sm dark:shadow-none space-y-2"><div className="flex items-center justify-between"><span className="text-xs font-medium text-slate-900 dark:text-slate-200">{issue.title}</span><span className={issue.severity === "CRITICAL" ? "badge-critical" : "badge-warning"}>{issue.severity}</span></div><p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{issue.description}</p><div className="text-[11px] font-mono text-slate-500 pt-1">Impact: <span className="text-rose-600 dark:text-rose-400 font-medium">{issue.impact}</span></div></div>)}</div></div><div className="p-6 rounded-lg border border-slate-200 dark:border-slate-900 bg-white dark:bg-[#0a0a0a] space-y-5 flex flex-col justify-between"><div className="space-y-5"><div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-900 pb-3"><div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-blue-500"/><h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200 tracking-tight">Autonomous Recommendations</h3></div></div><div className="space-y-3">{summary?.recommended_actions?.map((act) => <div key={act.id} className="p-4 rounded border border-slate-100 dark:border-slate-800/50 border-l-2 border-l-blue-500 dark:border-l-blue-500 bg-white dark:bg-slate-900/50 shadow-sm dark:shadow-none space-y-2"><div className="flex items-center justify-between"><span className="text-xs font-medium text-slate-900 dark:text-slate-200">{act.title}</span><span className="badge-info font-mono">{Math.round(act.confidence * 100)}% Conf</span></div><p className="text-[11px] text-slate-600 dark:text-slate-400 font-mono pt-1">Benefit: <span className="text-blue-600 dark:text-blue-400 font-medium">{act.expected_impact}</span></p></div>)}</div></div></div></section>

      <ExplainModal isOpen={isWhyModalOpen} onClose={() => setIsWhyModalOpen(false)} />
    </div>
  );
}
