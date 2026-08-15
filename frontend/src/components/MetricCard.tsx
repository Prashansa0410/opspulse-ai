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

  const borderColor =
    severity === "critical"
      ? "border-rose-800/80 bg-rose-950/20"
      : severity === "warning"
      ? "border-amber-800/70 bg-amber-950/15"
      : "border-slate-800/80 bg-[#111827]/90";

  return (
    <div className={`p-4 rounded-xl border ${borderColor} flex flex-col justify-between transition-all hover:border-slate-700 shadow-sm`}>
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-slate-400">{title}</span>
        {hasWhyButton && (
          <button
            onClick={onWhyClick}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-950/90 text-blue-400 border border-blue-700/80 text-[11px] font-mono font-bold hover:bg-blue-900/90 hover:text-white transition-all shadow-sm"
          >
            <Sparkles className="w-3 h-3" />
            <span>WHY?</span>
          </button>
        )}
      </div>

      <div className="my-2">
        <div className="text-2xl lg:text-3xl font-bold tracking-tight text-white font-mono">
          {prefix}{typeof value === "number" ? value.toLocaleString() : value}{suffix}
        </div>
        {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      {delta !== undefined && (
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span
            className={`flex items-center font-semibold ${
              isGood ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {Math.abs(delta)}%
          </span>
          <span className="text-slate-400 text-[11px]">{deltaLabel}</span>
        </div>
      )}
    </div>
  );
};
