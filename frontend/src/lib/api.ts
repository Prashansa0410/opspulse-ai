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

let currentToken: string | null = null;

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (currentToken) {
    headers["Authorization"] = `Bearer ${currentToken}`;
  }

  const res = await fetch(url, {
    headers: {
      ...headers,
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      // Force logout on 401
      localStorage.removeItem("opspulse_token");
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(`API call failed [${res.status}]: ${errorText}`);
  }
  return res.json();
}

export const api = {
  setToken: (token: string | null) => {
    currentToken = token;
  },

  // Auth
  login: async (credentials: any): Promise<{ access_token: string }> => {
    // FastAPI OAuth2PasswordRequestForm expects form data, but our custom /auth/login accepts JSON or Form.
    // Let's use x-www-form-urlencoded
    const params = new URLSearchParams();
    params.append("username", credentials.username);
    params.append("password", credentials.password);

    const url = `${API_BASE}/auth/login`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString()
    });
    if (!res.ok) throw new Error("Login failed");
    return res.json();
  },

  // KPIs
  getKPIs: async (days: number = 30): Promise<{ status: string; summary: ExecutiveSummary; timeseries: KPITimeseriesItem[] }> => {
    return fetchJson(`/kpis?days=${days}`);
  },

  // Warehouses
  getWarehouses: async (): Promise<{ status: string; total_warehouses: number; data: WarehouseScorecard[] }> => {
    return fetchJson("/warehouses");
  },

  // Carriers
  getCarriers: async (): Promise<{ status: string; total_carriers: number; data: CarrierScorecard[] }> => {
    return fetchJson("/carriers");
  },

  // Orders
  getOrders: async (params?: Record<string, any>): Promise<any> => {
    const query = new URLSearchParams(params || {}).toString();
    return fetchJson(`/orders?${query}`);
  },

  // SLA Risk
  getSLARisk: async (limit: number = 25): Promise<{ status: string; high_risk_in_flight_count: number; feature_importances: Record<string, number>; model_evaluation: Record<string, number>; shipments: SLARiskShipment[] }> => {
    return fetchJson(`/sla-risk?limit=${limit}`);
  },

  // Anomalies
  getAnomalies: async (): Promise<{ status: string; active_anomalies_count: number; critical_count: number; warning_count: number; data: AnomalyEvent[] }> => {
    return fetchJson("/anomalies");
  },

  // Root Causes
  getRootCauses: async (metric: string = "on_time_delivery_rate"): Promise<{ status: string; data: RootCauseData }> => {
    return fetchJson(`/root-causes?metric=${metric}`);
  },

  // Simulations
  runSimulation: async (body: {
    title?: string;
    intervention_type?: string;
    source_warehouse_id: string;
    target_warehouse_id: string;
    volume_shift_pct: number;
  }): Promise<SimulationResult> => {
    return fetchJson("/simulations", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  getRecentSimulations: async (): Promise<{ status: string; data: any[] }> => {
    return fetchJson("/simulations");
  },

  // AI Operations Analyst
  queryAI: async (query: string): Promise<AIQueryResponse> => {
    return fetchJson("/ai/query", {
      method: "POST",
      body: JSON.stringify({ query }),
    });
  },

  // Data Quality
  getDataQuality: async (): Promise<{ status: string; data: DQReport }> => {
    return fetchJson("/data-quality");
  },

  // System Health
  getSystemHealth: async (): Promise<any> => {
    return fetchJson("/health");
  },

  // HITL Workflow
  getRecommendations: async (): Promise<any[]> => {
    return fetchJson("/hitl/recommendations");
  },

  reviewRecommendation: async (id: string, status: string, comments?: string): Promise<any> => {
    return fetchJson(`/hitl/recommendations/${id}/review`, {
      method: "POST",
      body: JSON.stringify({ status, comments })
    });
  }
};
