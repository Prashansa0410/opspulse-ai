"use client";

import React, { useState } from "react";
import { TrendingUp, TrendingDown, HelpCircle, ArrowUpRight, ArrowDownRight, Sparkles } from "lucide-react";
import { ExplainModal } from "./ExplainModal";

interface MetricCardProps {
  title: string;
  value: string | number;
  delta?: number;
  deltaLabel?: string;
  isPositiveGood?: boolean;
  prefix?: string;
  suffix?: string;
  hasWhyButton?: boolean;
  subtitle?: string;
  severity?: "normal" | "warning" | "critical";
  onWhyClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  delta,
  deltaLabel = "vs last period",
  isPositiveGood = true,
  prefix = "",
  suffix = "",
  hasWhyButton = false,
  subtitle,
  severity = "normal",
  onWhyClick,
}) => {
  const isPositive = delta !== undefined && delta >= 0;
  const isGood = isPositive === isPositiveGood;

  const severityStyles =
    severity === "critical"
      ? "border-t-2 border-t-rose-500 border-x-slate-200 dark:border-x-slate-900 border-b-slate-200 dark:border-b-slate-900 bg-white dark:bg-[#0a0a0a]"
      : severity === "warning"
      ? "border-t-2 border-t-amber-500 border-x-slate-200 dark:border-x-slate-900 border-b-slate-200 dark:border-b-slate-900 bg-white dark:bg-[#0a0a0a]"
      : "border-slate-200 dark:border-slate-900 bg-white dark:bg-[#0a0a0a]";

  return (
    <div className={`p-5 rounded-lg border shadow-sm dark:shadow-none ${severityStyles} flex flex-col justify-between transition-colors hover:border-slate-300 dark:hover:border-slate-800`}>
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{title}</span>
        {hasWhyButton && (
          <button
            onClick={onWhyClick}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 dark:bg-slate-900 text-blue-600 dark:text-blue-400 text-[10px] font-mono tracking-wide hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            <span>DIAGNOSE</span>
          </button>
        )}
      </div>

      <div className="my-2">
        <div className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
          {prefix}{typeof value === "number" ? value.toLocaleString() : value}{suffix}
        </div>
        {subtitle && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      {delta !== undefined && (
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span
            className={`flex items-center font-semibold ${
              isGood ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {Math.abs(delta)}%
          </span>
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">{deltaLabel}</span>
        </div>
      )}
    </div>
  );
};
