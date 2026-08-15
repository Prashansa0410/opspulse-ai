"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Radio,
  Warehouse,
  Truck,
  ShieldAlert,
  AlertTriangle,
  GitFork,
  Sparkles,
  Sliders,
  CheckCircle,
  CheckCircle2,
  Server,
  ChevronRight
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navigationItems = [
    {
      group: "Operations Core",
      items: [
        { href: "/", label: "Executive Overview", icon: <LayoutDashboard className="w-4 h-4" />, badge: null },
        { href: "/tower", label: "Control Tower", icon: <Radio className="w-4 h-4" />, badge: "LIVE" },
        { href: "/warehouses", label: "Warehouses", icon: <Warehouse className="w-4 h-4" />, badge: "Alert" },
        { href: "/carriers", label: "Carrier Analytics", icon: <Truck className="w-4 h-4" />, badge: null },
        { href: "/approvals", label: "Approvals & Audit", icon: <CheckCircle className="w-4 h-4" />, badge: null },
      ]
    },
    {
      group: "Intelligence & ML",
      items: [
        { href: "/sla-risk", label: "SLA Risk Model", icon: <ShieldAlert className="w-4 h-4" />, badge: "ML" },
        { href: "/anomalies", label: "Anomaly Center", icon: <AlertTriangle className="w-4 h-4 text-amber-400" />, badge: "9" },
        { href: "/root-cause", label: "Root Cause Explorer", icon: <GitFork className="w-4 h-4" />, badge: null },
      ]
    },
    {
      group: "Decision Support & AI",
      items: [
        { href: "/ai-analyst", label: "AI Ops Analyst", icon: <Sparkles className="w-4 h-4 text-cyan-400" />, badge: "Agent" },
        { href: "/simulations", label: "What-If Simulations", icon: <Sliders className="w-4 h-4 text-indigo-400" />, badge: "Lab" },
      ]
    },
    {
      group: "Data Engineering",
      items: [
        { href: "/data-quality", label: "Data Quality Hub", icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, badge: "100%" },
        { href: "/system-health", label: "System & Telemetry", icon: <Server className="w-4 h-4" />, badge: "Healthy" },
      ]
    }
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800/80 bg-[#090d16] flex flex-col justify-between p-3 hidden md:flex min-h-[calc(100vh-57px)]">
      <div className="space-y-5">
        {navigationItems.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <h3 className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              {group.group}
            </h3>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? "bg-blue-600/15 text-blue-400 border border-blue-600/30 font-semibold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={isActive ? "text-blue-400" : "text-slate-400"}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                          item.badge === "LIVE" || item.badge === "Alert"
                            ? "bg-rose-950 text-rose-300 border border-rose-800"
                            : item.badge === "ML" || item.badge === "Agent"
                            ? "bg-cyan-950 text-cyan-300 border border-cyan-800"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Database & DuckDB Status pill */}
      <div className="p-3 bg-slate-900/80 border border-slate-800/80 rounded-lg space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Warehouse Engine</span>
          <span className="text-emerald-400 font-mono font-medium">DuckDB Vector</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Stream Buffer</span>
          <span className="text-blue-400 font-mono font-medium">Kafka Ready</span>
        </div>
        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full w-full"></div>
        </div>
      </div>
    </aside>
  );
};
