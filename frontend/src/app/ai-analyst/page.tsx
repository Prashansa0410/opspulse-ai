"use client";

import React, { useState } from "react";
import { Sparkles, Send, Terminal, ShieldCheck, CheckCircle2, Clock, FileCode } from "lucide-react";
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            <span>AI Operations Analyst</span>
          </h1>
          <p className="text-xs text-slate-400">
            Autonomous decision intelligence agent with verified SQL execution, multi-tool calling, and zero-hallucination mathematical citations.
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
              className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-medium transition-all text-left shadow-sm disabled:opacity-50"
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
        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 focus-within:border-blue-500 shadow-lg transition-colors">
          <input
            type="text"
            placeholder="Ask anything about orders, fulfillment bottlenecks, carrier delays, SLA breach predictions..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            className="w-full bg-transparent text-white px-3 py-2 text-sm outline-none placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/25 shrink-0"
          >
            {loading ? <Clock className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Analyze</span>
          </button>
        </div>
      </form>

      {/* Conversation Thread */}
      <div className="space-y-6">
        {conversation.map((msg, idx) => (
          <div key={idx} className="p-5 rounded-2xl border border-slate-800 bg-[#111827]/90 space-y-4 shadow-sm">
            
            {/* User Question */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center text-xs font-bold">
                  Q
                </div>
                <h3 className="text-sm font-bold text-white font-sans">{msg.query}</h3>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                <span>Latency: <strong className="text-emerald-400">{msg.latency_ms}ms</strong></span>
                <span>{msg.timestamp}</span>
              </div>
            </div>

            {/* Tool Calls Execution Trace */}
            {msg.tool_calls && msg.tool_calls.length > 0 && (
              <div className="p-3 rounded-lg bg-slate-950/90 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 font-semibold uppercase">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Executed Tools & SQL Queries ({msg.tool_calls.length})</span>
                </div>
                <div className="space-y-1 font-mono text-xs">
                  {msg.tool_calls.map((tc, tIdx) => (
                    <div key={tIdx} className="flex items-center gap-2 text-slate-300">
                      <span className="text-emerald-400">✓</span>
                      <span className="text-blue-400 font-semibold">{tc.tool}()</span>
                      <span className="text-slate-400 text-[11px]">{JSON.stringify(tc.args)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Formatted Response */}
            <div className="text-sm text-slate-200 leading-relaxed font-sans prose prose-invert max-w-none space-y-2">
              <div className="whitespace-pre-line">
                {msg.response}
              </div>
            </div>

            {/* Citations & Evidence Footnote */}
            {msg.citations && msg.citations.length > 0 && (
              <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <FileCode className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Verified Data Sources: {msg.citations.join(" • ")}</span>
              </div>
            )}

          </div>
        ))}
      </div>

    </div>
  );
}
