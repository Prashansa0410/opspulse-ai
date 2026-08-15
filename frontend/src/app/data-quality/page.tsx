"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, ShieldCheck, AlertTriangle, XCircle, RefreshCw, FileText, Database } from "lucide-react";
import { api } from "../../lib/api";
import { DQReport } from "../../lib/types";

export default function DataQualityPage() {
  const [report, setReport] = useState<DQReport | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDQ = () => {
    setLoading(true);
    api.getDataQuality()
      .then((res) => setReport(res.data))
      .catch((err) => console.error("Error fetching DQ report:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDQ();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Data Quality Validation Hub & Governance</span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Automated testing framework auditing primary key uniqueness, foreign key integrity, chronological validity, and financial constraints across 10M+ events.
          </p>
        </div>

        <button
          onClick={fetchDQ}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white text-xs font-mono transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Execute Audit Suite</span>
        </button>
      </div>

      {/* Headline DQ Score Card */}
      {report && (
        <div className="p-6 rounded-2xl border border-emerald-800/80 bg-emerald-950/20 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center shadow-lg">
          <div className="sm:col-span-2 space-y-1">
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 uppercase font-semibold">
              Composite Data Health Score
            </span>
            <div className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono">
              {report.dq_score_pct}%
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300">
              Audit ID: <strong className="font-mono">{report.log_id}</strong> • Date: {report.audit_date}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs font-mono">
            <span className="text-slate-600 dark:text-slate-400">Rules Passed</span>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {report.passed_checks} / {report.total_checks}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs font-mono">
            <span className="text-slate-600 dark:text-slate-400">Critical / Warnings</span>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-1">
              <span className="text-rose-600 dark:text-rose-400">{report.critical_issues_count}</span> / <span className="text-amber-600 dark:text-amber-400">{report.warnings_count}</span>
            </div>
          </div>
        </div>
      )}

      {/* Rules Breakdown Table */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold font-mono text-slate-900 dark:text-white uppercase tracking-wider">
          Data Quality Test Rules & Assertions
        </h2>

        {loading ? (
          <div className="py-12 text-center text-slate-600 dark:text-slate-400 text-sm">
            Executing assertion tests across analytical warehouse tables...
          </div>
        ) : report ? (
          <div className="space-y-3">
            {report.rules_results.map((rule) => (
              <div
                key={rule.rule_id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]/90 space-y-2 hover:border-slate-300 dark:border-slate-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold">{rule.rule_id}</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{rule.rule_name}</span>
                    <span className="badge-neutral text-[10px]">{rule.category}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={
                        rule.status === "PASSED"
                          ? "badge-success"
                          : rule.severity === "CRITICAL"
                          ? "badge-critical"
                          : "badge-warning"
                      }
                    >
                      {rule.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300">{rule.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-800/80">
                  <span>Target Table: <strong className="text-slate-800 dark:text-slate-200">{rule.table_name}</strong></span>
                  <span>Records Audited: <strong className="text-slate-800 dark:text-slate-200">{rule.records_checked.toLocaleString()}</strong></span>
                  <span>Failures: <strong className={rule.failed_records_count > 0 ? "text-rose-600 dark:text-rose-400 font-bold" : "text-emerald-600 dark:text-emerald-400"}>{rule.failed_records_count}</strong> ({rule.failure_rate_pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

    </div>
  );
}
