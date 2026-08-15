export interface ExecutiveSummary {
  snapshot_date: string;
  orders_today: number;
  revenue_today: number;
  gmv_today: number;
  on_time_delivery_rate: number;
  on_time_delivery_delta: number;
  sla_breach_rate: number;
  gmv_at_risk: number;
  gmv_at_risk_delta_pct: number;
  avg_fulfillment_hours: number;
  avg_warehouse_hours: number;
  avg_carrier_pickup_delay_hours: number;
  avg_transit_hours: number;
  payment_failure_rate: number;
  payment_failure_delta: number;
  support_ticket_rate: number;
  return_rate: number;
  active_anomalies_count: number;
  top_issues: {
    id: string;
    severity: "CRITICAL" | "WARNING" | "INFO";
    title: string;
    description: string;
    impact: string;
    action_id: string;
  }[];
  recommended_actions: {
    id: string;
    title: string;
    expected_impact: string;
    confidence: number;
    type: string;
  }[];
}

export interface KPITimeseriesItem {
  kpi_date: string;
  total_orders: number;
  total_revenue: number;
  total_gmv: number;
  on_time_delivery_rate: number;
  sla_breach_rate: number;
  gmv_at_risk: number;
  avg_fulfillment_hours: number;
  avg_warehouse_hours: number;
  avg_carrier_pickup_delay_hours: number;
  avg_transit_hours: number;
  payment_failure_rate: number;
  support_ticket_rate: number;
}

export interface WarehouseScorecard {
  warehouse_id: string;
  warehouse_name: string;
  code: string;
  city: string;
  state: string;
  capacity_orders_per_day: number;
  avg_utilization_pct: number;
  avg_packing_hours: number;
  total_orders_assigned: number;
  total_sla_breaches: number;
  avg_sla_breach_rate: number;
  current_backlog: number;
  operational_health: "HEALTHY" | "WARNING" | "CRITICAL_CONGESTION";
}

export interface CarrierScorecard {
  carrier_id: string;
  carrier_name: string;
  service_type: string;
  base_sla_hours: number;
  cost_per_kg: number;
  total_shipments: number;
  avg_on_time_rate: number;
  avg_pickup_delay_hours: number;
  avg_transit_time_hours: number;
  delivery_failed_count: number;
  tier_status: "OPTIMAL" | "MONITORING" | "UNDERPERFORMING";
}

export interface AnomalyEvent {
  anomaly_id: string;
  detected_at: string;
  metric_name: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  severity: "CRITICAL" | "WARNING" | "NORMAL";
  expected_value: number;
  actual_value: number;
  deviation_percent: number;
  z_score: number;
  summary: string;
  root_cause_hint: string;
  is_active: boolean;
}

export interface RootCauseData {
  metric_analyzed: string;
  baseline_otd_pct: number;
  incident_otd_pct: number;
  net_drop_pct: number;
  total_breached_orders: number;
  total_gmv_at_risk: number;
  primary_verdict: string;
  stage_breakdown: {
    stage: string;
    breach_count: number;
    contribution_pct: number;
    gmv_impact: number;
    severity: string;
  }[];
  top_affected_warehouses: {
    warehouse_id: string;
    warehouse_name: string;
    code: string;
    total_orders: number;
    breach_count: number;
    breach_rate: number;
    gmv_at_risk: number;
    share_of_total_breaches: number;
  }[];
  top_affected_carriers: {
    carrier_id: string;
    carrier_name: string;
    total_shipments: number;
    delayed_shipments: number;
    delay_rate: number;
    share_of_delays: number;
  }[];
  top_affected_regions: {
    region_id: string;
    region_name: string;
    total_orders: number;
    breach_count: number;
    breach_rate: number;
    gmv_at_risk: number;
  }[];
  time_window: string;
}

export interface SLARiskShipment {
  shipment_id: string;
  order_number: string;
  warehouse: string;
  carrier: string;
  route: string;
  order_value: number;
  promised_delivery: string;
  status: string;
  risk_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  top_factors: {
    feature: string;
    impact: string;
    severity: string;
  }[];
}

export interface SimulationResult {
  simulation_id: string;
  title: string;
  intervention_type: string;
  baseline: {
    source_warehouse: string;
    source_utilization_pct: number;
    target_warehouse: string;
    target_utilization_pct: number;
    system_on_time_delivery_rate: number;
    gmv_at_risk: number;
  };
  simulated: {
    source_warehouse: string;
    source_utilization_pct: number;
    target_warehouse: string;
    target_utilization_pct: number;
    system_on_time_delivery_rate: number;
    orders_reallocated_daily: number;
    expected_packing_time_hours: number;
  };
  expected_otd_lift: number;
  gmv_saved: number;
  confidence_score: number;
  assumptions: string[];
  risks_notes: string[];
  status: string;
  created_at: string;
}

export interface AIQueryResponse {
  query: string;
  response: string;
  tool_calls: {
    tool: string;
    args: Record<string, any>;
    status: string;
  }[];
  citations: string[];
  latency_ms: number;
  timestamp: string;
}

export interface DQReport {
  log_id: string;
  audit_date: string;
  total_checks: number;
  passed_checks: number;
  failed_checks: number;
  dq_score_pct: number;
  critical_issues_count: number;
  warnings_count: number;
  rules_results: {
    rule_id: string;
    rule_name: string;
    category: string;
    severity: string;
    status: string;
    table_name: string;
    records_checked: number;
    failed_records_count: number;
    failure_rate_pct: number;
    description: string;
  }[];
}

export type PersonaType = "OPS_MANAGER" | "BUSINESS_MANAGER" | "DATA_ANALYST" | "EXECUTIVE";
