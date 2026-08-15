# OpsPulse AI: Primary Incident Demo Scenario

**Title**: Flash Sale Volume Surge & Regional Fulfillment Congestion  
**Incident Period**: Day 22 to Day 26 of 30-Day Operational Horizon  

---

## 1. Incident Storyline & Causal Chain

1. **Volume Surge**:
   - A Mega Weekend Flash Sale triggers a **2.4x order surge** across the South Metropolis region.
2. **Facility Saturation**:
   - **`WH_BLR_01` (Bangalore Mega FC)** intake exceeds sorting throughput, pushing facility utilization to **94.6%** (>85% saturation threshold).
   - Packing and processing duration escalates from a baseline **2.4 hours** to **7.8 hours**.
3. **Carrier Linehaul Backlog**:
   - Primary 3PL shipping partner **SwiftExpress Direct** suffers truck turnaround delays at the BLR-01 dock, resulting in **8.4 hours average pickup latency**.
4. **Business Impact**:
   - System-wide **On-Time Delivery (OTD) drops from 93.8% to 88.7%** (-5.1% absolute drop).
   - **₹3.24 Cr in GMV is placed at breach risk** across 420 in-flight orders.
   - Delivery delay support tickets surge from 1.2% to 5.8%.
5. **Concurrent Payment Anomaly**:
   - Payment provider **PayFast** experiences upstream gateway timeouts, spiking transaction failure rates to **7.4%** (normal 1.8%).

---

## 2. Step-by-Step Interactive Demo Walkthrough

### Step 1: Open Executive Overview (`/`)
- Observe headline KPIs: **On-Time Delivery at 88.7% (↓ 5.1%)** and **GMV at Risk at ₹3.24 Cr**.
- View Top Operational Issues highlighting `BLR-01 Fulfillment Delay` and `SwiftExpress Backlog`.

### Step 2: Click "WHY?" on the OTD Metric Card
- The **Explainability Breakdown Drawer** opens immediately.
- Inspect the mathematical stage contribution:
  - **Warehouse Processing**: 42% contribution
  - **Carrier Dock Delay**: 34% contribution
  - **Transit Chokepoints**: 18% contribution
  - **Last-Mile Latency**: 6% contribution
- See `BLR-01` and `SwiftExpress` identified as top affected nodes.

### Step 3: Navigate to Warehouse Analytics (`/warehouses`)
- Observe `BLR-01` highlighted in **CRITICAL CONGESTION** badge with utilization at **94.6%**.
- Compare with sister facility `BLR-02` (Bangalore South Satellite) operating at **55.2%** utilization with available headroom.

### Step 4: Navigate to SLA Risk ML Inspector (`/sla-risk`)
- Review model evaluation metrics: **ROC-AUC: 94.2%**, **F1-Score: 89.4%**.
- Inspect in-flight high-risk shipments scored in real time with top contributing features (e.g. `Warehouse Utilization > 80%: +0.32 Risk`).

### Step 5: Ask AI Operations Analyst (`/ai-analyst`)
- Ask: *"Why did on-time delivery fall yesterday?"*
- Observe transparent tool execution: `get_root_causes()`, `get_warehouse_performance()`.
- Review synthesized response with exact quantitative citations and no hallucinated numbers.

### Step 6: Launch What-If Simulation Lab (`/simulations`)
- Select **Source**: `WH_BLR_01` (Bangalore Mega FC)
- Select **Target**: `WH_BLR_02` (Bangalore South Satellite)
- Set **Volume Shift**: `18%`
- Click **"Execute Simulation"**:
  - **Before**: BLR-01 at 94.6% util, OTD at 88.7%
  - **After**: BLR-01 normalized to 79.4% util, BLR-02 rises to 73.2%
  - **Predicted Result**: **+4.9% OTD Lift (93.6% OTD)**, securing **₹1.38 Cr in GMV**.
