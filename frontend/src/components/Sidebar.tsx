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

import { useAuth } from "../lib/auth";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const role = user?.role || "EXECUTIVE";

  const allNavigationItems = [
    {
      group: "Operations Core",
      items: [
        { href: "/", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" />, badge: null, roles: ["EXECUTIVE", "OPS_MANAGER", "DATA_ANALYST"] },
        { href: "/tower", label: "Control Tower", icon: <Radio className="w-4 h-4" />, badge: "LIVE", roles: ["EXECUTIVE", "OPS_MANAGER"] },
        { href: "/warehouses", label: "Warehouses", icon: <Warehouse className="w-4 h-4" />, badge: "Alert", roles: ["EXECUTIVE", "OPS_MANAGER", "DATA_ANALYST"] },
        { href: "/carriers", label: "Carrier Analytics", icon: <Truck className="w-4 h-4" />, badge: null, roles: ["EXECUTIVE", "OPS_MANAGER", "DATA_ANALYST"] },
        { href: "/approvals", label: "Approvals & Audit", icon: <CheckCircle className="w-4 h-4" />, badge: null, roles: ["EXECUTIVE"] },
      ]
    },
    {
      group: "Intelligence & ML",
      items: [
        { href: "/sla-risk", label: "SLA Risk Model", icon: <ShieldAlert className="w-4 h-4" />, badge: "ML", roles: ["EXECUTIVE", "DATA_ANALYST"] },
        { href: "/anomalies", label: "Anomaly Center", icon: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />, badge: "9", roles: ["EXECUTIVE", "OPS_MANAGER", "DATA_ANALYST"] },
        { href: "/root-cause", label: "Root Cause Explorer", icon: <GitFork className="w-4 h-4" />, badge: null, roles: ["EXECUTIVE", "OPS_MANAGER", "DATA_ANALYST"] },
      ]
    },
    {
      group: "Decision Support & AI",
      items: [
        { href: "/ai-analyst", label: "AI Ops Analyst", icon: <Sparkles className="w-4 h-4 text-cyan-400" />, badge: "Agent", roles: ["EXECUTIVE", "OPS_MANAGER", "DATA_ANALYST"] },
        { href: "/simulations", label: "What-If Simulations", icon: <Sliders className="w-4 h-4 text-indigo-400" />, badge: "Lab", roles: ["EXECUTIVE", "OPS_MANAGER"] },
      ]
    },
    {
      group: "Data Engineering",
      items: [
        { href: "/data-quality", label: "Data Quality Hub", icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />, badge: "100%", roles: ["EXECUTIVE", "DATA_ANALYST"] },
        { href: "/system-health", label: "System & Telemetry", icon: <Server className="w-4 h-4" />, badge: "Healthy", roles: ["EXECUTIVE", "DATA_ANALYST"] },
      ]
    }
  ];

  const navigationItems = allNavigationItems.map(group => ({
    ...group,
    items: group.items.filter(item => item.roles.includes(role))
  })).filter(group => group.items.length > 0);

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-900 bg-slate-50 dark:bg-[#0a0a0a] flex flex-col justify-between p-4 hidden md:flex min-h-[calc(100vh-57px)]">
      <div className="space-y-6">
        {navigationItems.map((group, gIdx) => (
          <div key={gIdx} className="space-y-2">
            <h3 className="px-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
              {group.group}
            </h3>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded text-[13px] font-medium transition-colors ${
                      isActive
                        ? "bg-blue-50 dark:bg-slate-900 text-blue-700 dark:text-slate-100 font-semibold"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={isActive ? "text-blue-600 dark:text-slate-300" : "text-slate-400 dark:text-slate-500"}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded tracking-wide ${
                          item.badge === "LIVE" || item.badge === "Alert"
                            ? "text-rose-500 dark:text-rose-400"
                            : item.badge === "ML" || item.badge === "Agent"
                            ? "text-blue-500 dark:text-blue-400"
                            : "text-slate-500"
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

      {/* Database Status pill */}
      <div className="px-3 py-2.5 border-t border-slate-200 dark:border-slate-900 space-y-2 mt-4">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">Engine</span>
          <span className="text-slate-700 dark:text-slate-300 font-mono">DuckDB Vector</span>
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">Buffer</span>
          <span className="text-slate-700 dark:text-slate-300 font-mono">Kafka</span>
        </div>
      </div>
    </aside>
  );
};
