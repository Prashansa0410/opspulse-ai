"use client";

import React, { useState } from "react";
import { Sparkles, Send, Terminal, ShieldCheck, CheckCircle2, Clock, FileCode } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { api } from "../../lib/api";
import { AIQueryResponse } from "../../lib/types";

export default function AIAnalystPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<AIQueryResponse[]>([
    {
      query: "Why did on-time delivery fall yesterday?",
      response: `### Root Cause Analysis: On-Time Delivery Decline\n\n**Primary Finding**: On-Time Delivery dropped from **93.8%** to **88.7%** (net drop of **-5.1%**), placing **₹3,240,000.00** GMV at risk across **420** breached orders.\n\n#### Key Breakdown by Stage:\n1. **Warehouse Processing Bottlenecks (42% share)**:\n   - **Bangalore Mega FC (BLR-01)** experienced severe capacity saturation (94.6% utilization) with **34.2%** breach rate.\n2. **Carrier Dock Pickup Backlog (34% share)**:\n   - **SwiftExpress Direct** experienced an average dock delay of **8.4 hours** due to truck turnaround constraints.\n3. **Cross-Zone Transit Congestion (18% share)**:\n   - South-to-East interstate transit corridors faced route delays of +12.4 hours.\n\n**Recommended Tactical Step**: Reallocate 18% volume from \`BLR-01\` to sister hub \`BLR-02\` and shift excess freight to BlueDart Prime.`,
      tool_calls: [
        { tool: "get_root_causes", args: { metric: "on_time_delivery_rate" }, status: "SUCCESS" },
        { tool: "get_warehouse_performance", args: { warehouse_id: "WH_BLR_01" }, status: "SUCCESS" }
      ],
      citations: ["fct_daily_kpis, orders, shipments table attribution", "fct_warehouse_performance"],
      latency_ms: 28.4,
      timestamp: "2026-08-15 05:25:30"
    }
  ]);

  const samplePrompts = [
    "Why did on-time delivery fall yesterday?",
    "Which carrier is performing worst?",
    "Which warehouse caused the largest increase in SLA breaches?",
    "What is the estimated GMV at risk?",
    "Which shipments should operations prioritize?",
    "What should we do to fix SLA breaches?"
  ];

  const handleSend = async (queryText?: string) => {
    const q = queryText || prompt;
    if (!q.trim()) return;

    setLoading(true);
    setPrompt("");

    try {
      const res = await api.queryAI(q);
      setConversation((prev) => [res, ...prev]);
    } catch (err) {
      console.error("AI query failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-900 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-slate-400" />
            <span>AI Operations Analyst</span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-500 pt-1">
            Autonomous decision intelligence agent with verified SQL execution and tool calling.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="badge-success flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AST Guardrails Enforced</span>
          </span>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
          Suggested Operational Investigations
        </span>
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 text-xs font-medium transition-all text-left shadow-sm dark:shadow-none disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="relative"
      >
        <div className="flex items-center gap-2 p-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0a0a] focus-within:border-slate-400 dark:focus-within:border-slate-600 transition-colors">
          <input
            type="text"
            placeholder="Ask anything about orders, bottlenecks, carrier delays..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            className="w-full bg-transparent text-slate-900 dark:text-slate-100 px-3 py-2 text-sm outline-none placeholder:text-slate-500 dark:placeholder:text-slate-600"
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 dark:disabled:text-slate-600 text-white dark:text-slate-900 text-xs font-bold transition-colors shrink-0"
          >
            {loading ? <Clock className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Analyze</span>
          </button>
        </div>
      </form>

      {/* Conversation Thread */}
      <div className="space-y-6">
        {conversation.map((msg, idx) => (
          <div key={idx} className="p-5 rounded border border-slate-200 dark:border-slate-900 bg-white dark:bg-[#0a0a0a] space-y-4">
            
            {/* User Question */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-900 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 flex items-center justify-center text-slate-500 text-xs font-mono font-bold">
                  &gt;
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200 font-sans tracking-tight">{msg.query}</h3>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-600">
                <span>Latency: <strong className="text-slate-400">{msg.latency_ms}ms</strong></span>
                <span>{msg.timestamp}</span>
              </div>
            </div>

            {/* Tool Calls Execution Trace */}
            {msg.tool_calls && msg.tool_calls.length > 0 && (
              <div className="p-3 rounded bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <Terminal className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                  <span>Tools & SQL Executed ({msg.tool_calls.length})</span>
                </div>
                <div className="space-y-1 font-mono text-xs">
                  {msg.tool_calls.map((tc, tIdx) => (
                    <div key={tIdx} className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                      <span className="text-slate-600 dark:text-slate-500">✓</span>
                      <span className="text-blue-600 dark:text-blue-400 font-medium">{tc.tool}()</span>
                      <span className="text-slate-600 dark:text-slate-400 text-[11px]">{JSON.stringify(tc.args)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Formatted Response */}
            <div className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-sans prose dark:prose-invert max-w-none space-y-2">
              <ReactMarkdown>
                {msg.response}
              </ReactMarkdown>
            </div>

            {/* Citations & Evidence Footnote */}
            {msg.citations && msg.citations.length > 0 && (
              <div className="pt-3 border-t border-slate-200 dark:border-slate-900 flex items-center gap-2 text-[10px] font-mono text-slate-500">
                <FileCode className="w-3.5 h-3.5 shrink-0" />
                <span>Verified Sources: {msg.citations.join(" • ")}</span>
              </div>
            )}

          </div>
        ))}
      </div>

    </div>
  );
}
