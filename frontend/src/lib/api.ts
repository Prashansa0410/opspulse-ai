import {
  ExecutiveSummary,
  KPITimeseriesItem,
  WarehouseScorecard,
  CarrierScorecard,
  AnomalyEvent,
  RootCauseData,
  SLARiskShipment,
  SimulationResult,
  AIQueryResponse,
  DQReport
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let detail = "";
    try { detail = await res.text(); } catch { /* preserve HTTP error */ }
    throw new Error(`API call failed [${res.status}]: ${res.statusText}${detail ? ` — ${detail.slice(0, 300)}` : ""}`);
  }
  return res.json();
}

export const api = {
  // Generate a small bounded batch of fresh operational events on demand.
  generateLiveEvents: async (): Promise<{ status: string; orders_created: number; sla_breaches_created: number; payment_failures_created: number; generated_at: string }> => {
    return fetchJson("/live/tick", { method: "POST" });
  },

  // KPIs
  getKPIs: async (days: number = 30): Promise<{ status: string; summary: ExecutiveSummary; timeseries: KPITimeseriesItem[] }> => {
    return fetchJson(`/kpis?days=${days}&_ts=${Date.now()}`);
  },

  // Warehouses
  getWarehouses: async (): Promise<{ status: string; total_warehouses: number; data: WarehouseScorecard[] }> => fetchJson("/warehouses"),
  getCarriers: async (): Promise<{ status: string; total_carriers: number; data: CarrierScorecard[] }> => fetchJson("/carriers"),
  getOrders: async (params?: Record<string, any>): Promise<any> => {
    const query = new URLSearchParams(params || {}).toString();
    return fetchJson(`/orders?${query}`);
  },
  getSLARisk: async (limit: number = 25): Promise<{ status: string; high_risk_in_flight_count: number; feature_importances: Record<string, number>; model_evaluation: Record<string, number>; shipments: SLARiskShipment[] }> => fetchJson(`/sla-risk?limit=${limit}`),
  getAnomalies: async (): Promise<{ status: string; active_anomalies_count: number; critical_count: number; warning_count: number; data: AnomalyEvent[] }> => fetchJson("/anomalies"),
  getRootCauses: async (metric: string = "on_time_delivery_rate"): Promise<{ status: string; data: RootCauseData }> => fetchJson(`/root-causes?metric=${metric}`),
  runSimulation: async (body: { title?: string; intervention_type?: string; source_warehouse_id: string; target_warehouse_id: string; volume_shift_pct: number }): Promise<SimulationResult> => fetchJson("/simulations", { method: "POST", body: JSON.stringify(body) }),
  getRecentSimulations: async (): Promise<{ status: string; data: any[] }> => fetchJson("/simulations"),
  queryAI: async (query: string): Promise<AIQueryResponse> => fetchJson("/ai/query", { method: "POST", body: JSON.stringify({ query }) }),
  getDataQuality: async (): Promise<{ status: string; data: DQReport }> => fetchJson("/data-quality"),
  getSystemHealth: async (): Promise<any> => fetchJson("/health"),
};
