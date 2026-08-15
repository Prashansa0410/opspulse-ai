"use client";

import React, { useEffect, useState } from "react";
import { Radio, Search, Filter, Warehouse, Truck, RefreshCw, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { api } from "../../lib/api";

export default function ControlTowerPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [breachFilter, setBreachFilter] = useState("");
  const [search, setSearch] = useState("");
  const [liveEvents, setLiveEvents] = useState<string[]>([
    "[05:28:10] BLR-01: Order ORD_00003590 packed (2.4kg)",
    "[05:28:04] SwiftExpress: Dock Pickup delayed at Bangalore Hub (+8.4h)",
    "[05:27:52] BOM-01: Outbound linehaul truck dispatched to Delhi Gateway",
    "[05:27:40] Razorpay: Payment confirmed for Order ORD_00003588 (₹3,499)",
    "[05:27:22] DEL-01: 45 packages handed over to BlueDart Prime",
  ]);

  const fetchOrders = () => {
    setLoading(true);
    const params: Record<string, any> = { page: 1, page_size: 50 };
    if (statusFilter) params.status = statusFilter;
    if (breachFilter) params.is_breached = breachFilter === "true";
    
    api.getOrders(params)
      .then((res) => setOrders(res.data))
      .catch((err) => console.error("Error fetching orders:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, breachFilter]);

  // Simulate live event streaming pulses
  useEffect(() => {
    const interval = setInterval(() => {
      const hubs = ["BLR-01", "DEL-01", "BOM-01", "HYD-01", "CCU-01"];
      const actions = ["Order Packed", "Dock Handoff", "Out For Delivery", "Payment Confirmed", "Transit Scan"];
      const randomHub = hubs[Math.floor(Math.random() * hubs.length)];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      const randomId = Math.floor(Math.random() * 9000 + 1000);
      const timeStr = new Date().toLocaleTimeString();

      setLiveEvents((prev) => [
        `[${timeStr}] ${randomHub}: ${randomAction} for Order ORD_0000${randomId}`,
        ...prev.slice(0, 7)
      ]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const filteredOrders = orders.filter((o) =>
    search === "" ||
    o.order_number.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    o.warehouse_code.toLowerCase().includes(search.toLowerCase()) ||
    o.carrier_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Radio className="w-6 h-6 text-rose-500 animate-pulse" />
            <span>Operations Control Tower</span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Real-time telemetry, order fulfillment lifecycle, and active shipment monitoring across all fulfillment nodes.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white text-xs font-mono transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Stream</span>
        </button>
      </div>

      {/* Live Kafka Stream Ticker & Facility Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Stream Ticker */}
        <div className="lg:col-span-2 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]/90 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-600 dark:text-slate-400 font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Live Event Streaming Pipeline (Kafka / In-Memory Buffer)
            </span>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">350 events/sec</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/80 rounded-lg p-3 border border-slate-800/80 font-mono text-xs text-slate-700 dark:text-slate-300 space-y-1.5 max-h-36 overflow-y-auto">
            {liveEvents.map((evt, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-700 dark:text-slate-300">
                <span className="text-blue-600 dark:text-blue-400">→</span>
                <span>{evt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Status Snapshot */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]/90 space-y-3 flex flex-col justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-600 dark:text-slate-400 font-semibold">
            Network Health Matrix
          </span>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2 rounded bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400">Active Warehouses</span>
              <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">6 / 6 FCs</div>
            </div>
            <div className="p-2 rounded bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400">Carrier Partners</span>
              <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">5 Carriers</div>
            </div>
            <div className="p-2 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60">
              <span className="text-rose-700 dark:text-rose-300">SLA Breach Alert</span>
              <div className="text-base font-bold text-rose-600 dark:text-rose-400 mt-0.5">BLR-01 (94.6%)</div>
            </div>
            <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60">
              <span className="text-amber-700 dark:text-amber-300">Pickup Backlog</span>
              <div className="text-base font-bold text-amber-600 dark:text-amber-400 mt-0.5">SwiftExpress</div>
            </div>
          </div>
        </div>

      </div>

      {/* Orders Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]/90">
        <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs">
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Search by Order #, Customer, Warehouse, Carrier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-slate-900 dark:text-white outline-none w-full placeholder:text-slate-500 font-sans"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono outline-none"
          >
            <option value="">All Statuses</option>
            <option value="DELIVERED">Delivered</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="ORDER_PACKED">Order Packed</option>
            <option value="PAYMENT_FAILED">Payment Failed</option>
          </select>

          <select
            value={breachFilter}
            onChange={(e) => setBreachFilter(e.target.value)}
            className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono outline-none"
          >
            <option value="">All SLAs</option>
            <option value="true">Breached SLA Only</option>
            <option value="false">On-Time SLA</option>
          </select>
        </div>
      </div>

      {/* Interactive Orders Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]/90 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Order Number</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Origin Hub</th>
                <th className="py-3 px-4">Carrier</th>
                <th className="py-3 px-4">Order Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">SLA Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-800 dark:text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-600 dark:text-slate-400 font-mono">
                    Loading telemetry records from analytical warehouse...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-600 dark:text-slate-400 font-mono">
                    No matching orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.order_id} className="hover:bg-slate-100 dark:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-blue-600 dark:text-blue-400">
                      {o.order_number}
                    </td>
                    <td className="py-3 px-4">
                      <div>{o.customer_name}</div>
                      <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono">{o.customer_tier}</span>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {o.warehouse_code}
                    </td>
                    <td className="py-3 px-4">
                      {o.carrier_name}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                      {o.order_date.substring(0, 16)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={
                          o.order_status === "DELIVERED"
                            ? "badge-success"
                            : o.order_status === "PAYMENT_FAILED"
                            ? "badge-critical"
                            : "badge-info"
                        }
                      >
                        {o.order_status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium">
                      ₹{Number(o.total_amount).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      {o.is_sla_breached ? (
                        <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-mono font-semibold">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Breached ({o.sla_breach_reason ? o.sla_breach_reason.replace("_", " ") : "Delayed"})</span>
                        </div>
                      ) : o.order_status === "DELIVERED" ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                          <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>On-Time</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-mono">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>In-Flight</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
