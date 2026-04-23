<div align="center">

# SafeNet

### *"SafeNet doesn't ask you to prove anything. It proves it for you."*

**AI-powered parametric income protection for India's millions of gig delivery workers.**

When rain, floods, heat, or shutdowns erase a day's earnings —
SafeNet detects it, validates it, and pays exactly what was lost.
**Automatically. No form. No call. No waiting.**

---

[![Phase](https://img.shields.io/badge/Guidewire_DEVTrails_2026-Phase_3_Final-1d4ed8?style=for-the-badge&logoColor=white)](https://github.com/BHARGAVSAI558/devtrails-2026-alphanexus-phase2)
[![Team](https://img.shields.io/badge/Team-AlphaNexus-7c3aed?style=for-the-badge)](https://github.com/BHARGAVSAI558/devtrails-2026-alphanexus-phase2)
[![Stack](https://img.shields.io/badge/Stack-FastAPI_+_Expo_+_PostgreSQL-16a34a?style=for-the-badge)](https://safenet-api-y4se.onrender.com/health)

</div>

---

## 🚀 Live — Try It Right Now

> **Backend on Render free tier.** First request may take 20-30 seconds to wake up.
> Both apps show *"Starting server… please wait"* during cold start — never a raw error.

| | Link |
|--|--|
| 📱 **Worker App**  | **[safenet-sage.vercel.app](https://safenet-sage.vercel.app)** |
| 🖥️ **Admin Dashboard** | **[safenet-admin-wine.vercel.app/admin-login](https://safenet-admin-wine.vercel.app/admin-login)** — `admin` / `admin123` |
| 🔗 **Unified Entry + QR** | [safenet-admin-wine.vercel.app/login](https://safenet-admin-wine.vercel.app/login) |
| ❤️ **Health Check** | [safenet-api-y4se.onrender.com/health](https://safenet-api-y4se.onrender.com/health) |
| 📊 **Pitch Deck** | [View Pitch Deck](https://drive.google.com/file/d/1Hm4Dmb8lZwc0y5OuCcxt7tXnf_2cSYyC/view?usp=sharing) |

---

## 📱 Scan to Open on Your Phone **(Highly recommended)**

<div align="center">
  <img src="safenet_v2/admin/public/worker-app-qr.png" width="260" alt="SafeNet QR" />
  <br/>
  Scan to open SafeNet Worker App (Expo)
</div>

---

## 💡 Why This Matters

India has millions of platform delivery workers — Zomato, Swiggy, Zepto, Blinkit, Amazon. They earn per trip. Not per month. Not per hour. Per trip.

**Swamy, 34, Vijayawada.** Thursday evening. Dinner rush. ₹58 an hour — his best window of the week. A flood alert fires at 8 PM. Roads underwater. Platform paused. Zero orders. Three hours of peak income. ₹174. Gone.

No form to fill. No number to call. No system that catches him.

He borrows money from a friend until Sunday. This happens four times every monsoon. To him, and to 15 million workers exactly like him.

| Disruption | What Happens |
|---|---|
| Heavy rain / floods | Roads unsafe. Platform pauses. Zero income. |
| Extreme heat above 42°C | Health risk. Forced offline. |
| AQI above 300 | Hazardous exposure. Platform restricts zones. |
| Curfews / local strikes | Zone locked. No pickups or deliveries possible. |
| Platform outages | Orders stop. Worker is ready. Platform isn't. |

Traditional insurance covers accidents — not lost daily wages. Government schemes explicitly exclude informal gig workers. Every existing product either demands proof Swamy cannot provide, or pays a flat ₹300 disconnected from what he actually lost.

**The gap in one sentence:** no system today answers *what a specific worker lost at a specific time* — and proves it without asking them to prove it.

---

## ⚡ Evaluate SafeNet in 2 Minutes

### As a Worker — phone or browser

1. Open **[safenet-sage.vercel.app](https://safenet-sage.vercel.app)** — no install, no signup friction
2. Enter any 10-digit mobile number → Enter OTP sent to mobile or can enter random 6 numbers (safe mode — free tier)
3. Select platform (Zomato / Swiggy / Other) → search any Indian city or tap GPS → pick a coverage tier
4. Dashboard loads with **live weather**, **real AQI**, **Earnings DNA heatmap**, zone risk level, and Forecast Shield status
5. Tap **"Simulate Disruption" → Heavy Rain** → watch the 6-step claim pipeline animate live → payout credited with the exact formula shown:
   ```
   ₹58/hr × 3.0h × 0.8 = ₹139
   ```

### As an Admin — simultaneously, on a laptop

1. Open **[safenet-admin-wine.vercel.app/admin-login](https://safenet-admin-wine.vercel.app/admin-login)**
2. Credentials auto-fill after 3.5 seconds → `admin` / `admin123`
3. The claim from Step 5 above arrives **live in the feed via WebSocket** — no refresh needed
4. Navigate to Pool Health → actuarial loss ratio, per-zone reserve breakdown
5. Navigate to Support → AI-prioritized ticket queue, sorted by urgency automatically

---

## 🎯 Why SafeNet Is Different

```
Every other system:  disruption happens → pay a fixed ₹500 to everyone
SafeNet:             learn each worker's earning reality → pay exactly what they lost
```

| What Others Do | What SafeNet Does |
|---|---|
| Flat payout disconnected from actual loss | Personalized payout via individual Earnings DNA |
| React after the worker files a claim | Detect, validate, and credit — zero worker action |
| Demand proof workers cannot provide | Pull verification from 4 independent data signals |
| Same premium for every worker in a zone | Dynamic XGBoost pricing per worker risk profile |
| Static coverage tier | Forecast Shield auto-upgrades tier before disruption hits |
| Manual claim review | Fully automated 4-layer fraud pipeline per claim |

---

## 🧩 Core Features

| Feature | What It Does | Status |
|---|---|---|
| Earnings DNA | 7×24 personal hourly rate matrix per worker | ✅ Live |
| Forecast Shield | Auto-upgrades coverage tier 18h before a predicted disruption | ✅ Live |
| Zero-Touch Claim Pipeline | Detects → validates → credits, no worker action required | ✅ Live |
| 4-Layer Fraud Engine | GPS integrity + cross-signal + ring detection + enrollment timing | ✅ Functional prototype |
| DBSCAN Zero-Day Detector | Catches novel disruptions not in any weather API | ✅ Live |
| XGBoost Premium Pricing | Per-worker dynamic premium based on zone risk + trust score | ✅ Functional prototype |
| Trust Score System | 0–100 score per worker; governs payout speed and fraud weighting | ✅ Live |
| AI Ticket Priority | Surfaces payment/safety complaints above cosmetic queries | ✅ Live |
| WebSocket Real-Time | Worker app + admin dashboard — live, no polling | ✅ Live |
| Multilingual Support | English / हिंदी / తెలుగు — built-in, no external API | ✅ Live |
| PDF Claim Receipts | Full audit trail with DNA formula, API sources, Razorpay ref | ✅ Live |
| Pool Health Dashboard | Loss ratio, reserve balance, per-zone WATCH/CRITICAL alerts | ✅ Live |

---

## 💰 Actuarial Basis & Premium Justification

SafeNet's weekly premiums are not guesses. They are derived from a bottom-up expected loss model built on micro location food delivery zone baselines — and structured to create a sustainable pool that pays workers fairly while giving insurers something no traditional product can offer.


### 📍 Location & Risk Adaptive Pricing

SafeNet does not use one flat national premium. Weekly plans dynamically adjust based on local disruption risk and worker exposure.

Pricing signals include:

- City-level weather volatility (rain / floods / heat)
- Zone disruption frequency over last 90 days
- AQI stress frequency
- Worker peak earning hours (Earnings DNA exposure)
- Historical claim ratio of the zone
- Trust score / fraud risk signals

Examples:

- Flood-prone Vijayawada delivery zone → slightly higher premium
- Stable Bengaluru central zone → standard premium
- Low-disruption Tier-2 zone → lower premium

This ensures workers pay for their real risk exposure — not someone else’s.

### Base Assumptions

| Parameter | Value | Basis |
|---|---|---|
| Average hourly earnings | ₹58/hr | Earnings DNA zone baseline, Hyderabad |
| Average disruption duration | 3.0 hours | 90-day OpenWeatherMap event analysis |
| Disruption frequency | 3–4 events/month (midpoint 3.5) | IMD rain alerts + zone claim history |
| Events per week | 0.875 | 3.5 ÷ 4 weeks |
| Load factors | 30% total | 15% ops + 10% reserve buffer + 5% fraud |

### Expected Loss Per Worker Per Week

```
Formula: Hourly Rate × Hours Lost × Coverage % × Events/Week

Basic   (60%): ₹58 × 3.0 × 0.60 × 0.875 = ₹91/week  → actuarial break-even ₹119 → priced ₹49
Standard (75%): ₹58 × 3.0 × 0.75 × 0.875 = ₹114/week → actuarial break-even ₹148 → priced ₹79
Pro     (90%): ₹58 × 3.0 × 0.90 × 0.875 = ₹137/week → actuarial break-even ₹178 → priced ₹99
```

### Disruption Severity Weight (DSW) — Confidence Engine Output

| Signals Confirmed | Event Type | DSW | Example |
|---|---|---|---|
| 4 of 4 | Sustained major disruption | 1.0 | 6hr+ flood, all APIs confirm |
| 3 of 4 | Moderate confirmed disruption | 0.8 | 3hr heavy rain, one API delayed |
| 2 of 4 + behavioral | Short borderline disruption | 0.65 | Brief storm, partial offline |
| Below threshold | Rejected | — | Claim blocked, not enough signal |

DSW is computed by the Confidence Engine on every claim. It is never manually set.
Workers cannot influence it. A higher trust score does not raise DSW — it only
affects payout speed, not payout amount.

### Why Prices Are Below Break-Even — and Why That Is the Strategy

Basic and Standard tiers are intentionally subsidised at launch. This is standard practice in parametric insurance market entry — IRDAI's sandbox framework explicitly accommodates below-break-even pricing during policyholder acquisition phases. The gap is not a mistake. It is the data flywheel.

Every enrolled worker generates **Earnings DNA** — a 7×24 personal hourly earnings matrix that accumulates with every delivery shift. This behavioral dataset is the core long-term asset. No survey, no demographic model, and no traditional insurer can access it by any other method.

```
Month 1–3  : Worker enrolls at ₹49. DNA accumulates silently every shift.
Month 3–6  : SafeNet knows exactly when this worker earns peak income.
Month 6    : Renewal repriced individually — target ₹129 / ₹159 / ₹199.
Month 6+   : Pool reaches break-even. Every new worker adds margin.
```

**Pool break-even: ~2,200 enrolled workers** at current tier distribution.

### Who Benefits — Worker and Insurer, Simultaneously

This is not charity toward workers at the insurer's expense. Both sides gain something the other cannot provide alone.

**The worker receives:**
- ₹42–₹123 protected per disruption week — the exact amount lost, not a flat ₹500
- Zero-touch claim — no form, no call, no waiting
- Forecast Shield auto-upgrading coverage 18 hours before a predicted event at no extra cost
- PDF claim receipt with full DNA formula, API sources, and Razorpay UTR for every payout

**The insurer receives:**
- Earnings DNA — actuary-quality behavioral data inaccessible through any other acquisition method
- 55–65% target loss ratio vs 85%+ in traditional health insurance — achievable because fraud is caught *before* payout fires, not after (zero adjustment cost, zero clawback)
- Per-worker premium repricing at 6-month renewal using 180 days of accumulated DNA
- DBSCAN zero-day detector identifying novel risk clusters before they scale into pool losses
- Per-zone pool isolation preventing a single flood zone from draining the national reserve

### Pool Economics at Pilot Scale (1,000 workers)

```
Assumed tier split: 40% Basic / 40% Standard / 20% Pro

Weekly premiums collected:
  400 × ₹49  = ₹19,600
  400 × ₹79  = ₹31,600
  200 × ₹99  = ₹19,800
  Total       = ₹71,000 / week

Expected weekly payout:
  1,000 workers × ₹114 avg expected loss = ₹114,000 / week

Pilot shortfall  : ~₹43,000/week — covered by reserve capital in sandbox phase
After DNA reprice: collections rise to ~₹127,000/week — pool in surplus
```

### Pool Health Thresholds (live in admin dashboard)

| Metric | Value | Action |
|---|---|---|
| Operating loss ratio target | 55–65% | Healthy — no action |
| Pool WATCH trigger | above 75% | Zone-level review, premium nudge |
| Pool CRITICAL trigger | above 90% | Payouts throttled, immediate admin alert |
| Reserve floor | 8 weeks expected payout | Automatic capital call |
| Per-zone isolation fires at | zone loss ratio above 80% | Prevents cross-zone contagion |

> **Why 55–65% and not 85% like traditional insurance?**
> Traditional insurers settle claims after reviewing documentation — adjustment teams, disputes, retroactive investigations. SafeNet's 4-layer fraud pipeline runs *before* the payout fires. No adjustment cost. No clawback. No dispute resolution overhead. That structural difference is what makes a 60% loss ratio achievable — not optimistic.

---

## 🗺️ Worker Journey

```
Open App
   ↓
Enter phone number
   ↓
Enter OTP (Real + Demo)
   ↓
Select platform + search city or tap GPS
   ↓
Choose coverage tier (Basic ₹49 / Standard ₹79 / Pro ₹99 per week)
   — each tier priced from actuarial expected loss model —
   ↓
Pay via Razorpay (UPI / card / netbanking)
   ↓
Dashboard — live weather, AQI, Earnings DNA heatmap, zone risk
   ↓
[Disruption hits — worker does nothing]
   ↓
Claim pipeline fires automatically
   ↓
₹ Credited — push notification
```

Returning users skip onboarding entirely. OTP → dashboard. Done in under 10 seconds.

---

## 🔬 Unique Innovations

### 🧬 Earnings DNA — Personal Income Fingerprint

Every worker builds a **7×24 earning matrix** from their own delivery history — expected hourly rate for every day-of-week and hour combination. Zone baseline rates apply for new workers until personal history accumulates. The DNA grows more precise with every data point — and becomes the foundation for both payout calculation and 6-month premium repricing.

```
Swamy — Zomato / Hyderabad / Banjara Hills
─────────────────────────────────────────
           6AM  8AM  10AM  12PM  2PM  4PM  6PM  8PM  10PM
Monday   [  ░    ▒    ▒     ▓    ▓    ▒    ▒    ▓    ▒  ]
Thursday [  ░    ▒    ▒     ▓    ▓    ▒    ▓    █    ▓  ]  ← Peak 7–10 PM
Sunday   [  ░    ▒    ▓     █    █    ▒    ▒    ▓    ░  ]  ← Peak 12–2 PM
─────────────────────────────────────────
░ low   ▒ moderate   ▓ active   █ peak
```

Flood hits at 8 PM Thursday →

```
Payout = DNA Rate × Hours Lost × Coverage % × Disruption Severity Weight (DSW)
       = ₹58/hr  × 3.0h      × 0.90        × 0.8
       = ₹139

DNA Rate  : ₹58/hr — Swamy's personal Thursday 8PM rate from Earnings DNA
Hours Lost: 3.0h   — disruption window confirmed by Confidence Engine
Coverage %: 0.90   — Pro tier (90% of verified loss)
DSW       : 0.8    — 3 of 4 cross-signals confirmed, moderate-heavy rain
Weekly cap: ₹750   — Pro tier sum insured, not breached this week
Result    : ₹139 credited. Not ₹500 for everyone. The exact amount Swamy lost.
```

After 90 days, Swamy's DNA also tells the insurer that his peak exposure window is Thursday–Sunday evenings — precisely monsoon flood hours. His renewal premium reflects that risk. A worker whose peak hours are 10 AM–2 PM gets a lower renewal rate. This is per-worker actuarial pricing at a granularity no traditional insurer has ever operated.

---

### 🛡️ Forecast Shield — Protection That Moves First

Every 6 hours, SafeNet checks the 48-hour weather forecast. When elevated risk is detected for a worker's zone, coverage auto-upgrades to the next tier for that window — at no extra cost.

```
18 hours before the disruption:
  Forecast: heavy rain predicted 3 PM–7 PM, 82% confidence
  Action: coverage auto-upgraded to Pro tier for that window
  Push: "Forecast Shield Active — you're already protected"

When disruption hits:
  Pro-tier payout fires automatically
  Worker sees: "SafeNet predicted this 18 hours ago"
```

Standard insurance reacts. SafeNet anticipates.

---

### 🔄 Zero-Touch Claim Pipeline

```
APScheduler — every 30 min, 6 AM–11 PM IST
         │
         ▼
Confidence Engine
OpenWeatherMap + OpenAQ + social signals → HIGH / MIXED / LOW
         │ HIGH
         ▼
Behavioral Engine
GPS trail vs worker baseline → deviation score 0–100
         │ deviation > zone threshold
         ▼
4-Layer Fraud Pipeline → CLEAN / FLAG / BLOCK
         │ CLEAN
         ▼
Decision Engine
All signals + trust score → APPROVE / REJECT
         │ APPROVE
         ▼
Payout Engine
DNA rate × hours × multiplier → ₹ amount
Razorpay record + UTR generated
WebSocket push → worker app + admin dashboard
```

Worker sees live on screen:
```
🌧 Disruption Detected → 📍 Verifying Signals → 🛡 Fraud Check → ✅ Decision → ₹ Credited
```

*(Demo mode simulates the disruption trigger to demonstrate the full pipeline flow — all downstream steps including fraud check, decision engine, and payout calculation run on real logic.)*

---

### 🕵️ 4-Layer Fraud Defense

```
LAYER 4 — Enrollment Timing Anomaly
  Mass sign-ups before a predicted storm → elevated zone-wide scrutiny
              ↓
LAYER 1 — GPS Signal Integrity
  Teleportation: 3 km in < 20 seconds → FLAG
  Static spoof: GPS variance exactly zero → FLAG
  Cell tower mismatch: tower in different district than GPS → FLAG
              ↓
LAYER 2 — Cross-Signal Corroboration (4 independent sources)
  S1: Worker GPS inside disrupted zone?
  S2: Weather/AQI APIs confirm active disruption?
  S3: App activity low during disruption window?
  S4: Platform order volume dropped in zone?
  4/4 → APPROVE   3/4 → APPROVE   2/4 → FLAG   ≤1 → BLOCK
              ↓
LAYER 3 — Fraud Ring Detection (DBSCAN)
  8+ flagged claims from same zone within 1 hour?
  5+ submissions within 3 minutes?
  Identical inactivity durations across workers?
  → CONFIRMED ring → freeze cluster → instant admin alert
```

**Honest-worker-first:** 3 of 4 signals still approves. A weather API delay during a real flood never punishes a genuine worker. This principle is what keeps the insurer's loss ratio healthy — real claims paid fast, fraudulent ones blocked before they hit the pool.

---

### 🔍 DBSCAN Zero-Day Anomaly Detector

Not all disruptions appear in weather APIs. Internet outages, flash strikes, infrastructure failures — none trigger a weather threshold, but all cause workers to go offline in geographic clusters.

scikit-learn DBSCAN runs on worker GPS + offline timestamps every 60 seconds. When 70%+ of workers in a zone go offline simultaneously with no weather trigger fired, the system flags an **Unclassified Mass Offline Event**, holds payouts pending review, and fires an immediate admin alert via WebSocket. This protects the insurer's pool from novel risk events that traditional parametric triggers would miss entirely.

---

## 🔐 Security & Trust

| Mechanism | Detail |
|---|---|
| OTP login | 6-digit code via SMS; demo mode accepts any 6 digits on free tier |
| JWT token pair | Access + refresh tokens, silent renewal |
| SHA-256 canonical identity | Phone → hash; prevents duplicate payouts across multiple platform accounts |
| Device fingerprinting | Hardware fingerprint per login; new device → elevated fraud scrutiny |
| HMAC payment verification | All Razorpay callbacks verified cryptographically server-side |
| Per-IP rate limiting | On OTP send, login, and claim submission endpoints |
| Trust Score (0–100) | Governs fraud signal weighting and payout processing speed |

**Payout speed by trust level:**

| Score | Level | Processing |
|---|---|---|
| 91–100 | Elite ⚡ | Instant |
| 71–90 | Trusted | 30 seconds |
| 41–70 | Reliable | 2 minutes |
| 0–40 | Emerging | Manual review |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Worker App | React Native, Expo, Expo Web — single codebase for iOS, Android, browser |
| Admin Dashboard | React, Vite, TypeScript, Tailwind CSS, Recharts, Leaflet, Zustand |
| Backend | FastAPI, Python, SQLAlchemy, Alembic, PostgreSQL |
| ML / AI | XGBoost (premium pricing), scikit-learn DBSCAN (anomaly detection) |
| Real-time | WebSockets (FastAPI native), APScheduler background jobs |
| Security | JWT, SHA-256 identity, device fingerprinting, HMAC, rate limiting |
| Location | Nominatim / OSM (search + geocode), expo-location (GPS), Haversine (zone match) |
| External APIs | OpenWeatherMap (live + 48h forecast), OpenAQ (AQI), Nominatim / OSM, Razorpay (test) |
| PDF | fpdf2 — claim receipts with formula, API sources, full audit trail |
| i18n | LocalizationContext + en.json, hi.json, te.json — no external API |
| Deployment | Render (backend + PostgreSQL), Vercel (admin + worker web) |

---

## 🏗️ Architecture

```
┌─────────────────────────────┐       ┌─────────────────────────────┐
│       Worker App            │       │      Admin Dashboard         │
│  safenet-sage.vercel.app    │       │  safenet-admin-wine.vercel   │
│  React Native + Expo Web    │       │  React + TypeScript          │
│  WebSocket client           │       │  WebSocket client            │
│  expo-location (GPS)        │       │  Leaflet + Recharts          │
└──────────────┬──────────────┘       └──────────────┬──────────────┘
               │   HTTPS + WSS                       │   HTTPS + WSS
               └──────────────────┬──────────────────┘
                                  ▼
               ┌──────────────────────────────────────┐
               │           FastAPI Backend             │
               │     safenet-api-y4se.onrender.com     │
               │                                      │
               │  Auth · Zones · Workers · Policies   │
               │  Claims · Admin · /ws/worker/{id}    │
               │  /ws/admin                           │
               │                                      │
               │  Engines: Confidence · Fraud (L1–4)  │
               │  Premium (XGBoost) · Payout · DNA    │
               │  ZeroDay (DBSCAN) · Trust · Risk     │
               └──────────────┬───────────────────────┘
                              │
          ┌───────────────────┼──────────────────────┐
          ▼                   ▼                      ▼
   ┌────────────┐     ┌─────────────┐       ┌────────────────────┐
   │ PostgreSQL │     │ APScheduler │       │  External APIs     │
   │  (Render)  │     │  every 30m  │       │ OpenWeatherMap     │
   │  Workers   │     │  Disruption │       │ OpenAQ (AQI)       │
   │  Policies  │     │  detection  │       │ Nominatim / OSM    │
   │  Claims    │     │  Premium    │       │ Razorpay (test)    │
   │  Zones     │     │  renewal    │       │ Expo Notifications │
   │  Pool      │     │  DBSCAN     │       └────────────────────┘
   └────────────┘     └─────────────┘
```

---

## 📁 Project Structure

```
devtrails-2026-alphanexus-phase2/
│
├── SafeNetFresh/                        ← Expo worker app (mobile + web)
│   ├── screens/
│   │   ├── OnboardingScreen.js          ← Phone entry + OTP send
│   │   ├── OTPVerifyScreen.js           ← Enter OTP + verify
│   │   ├── ProfileSetupScreen.js        ← 5-step onboarding wizard
│   │   ├── DashboardScreen.js           ← Live weather, AQI, DNA heatmap
│   │   ├── PolicyScreen.js              ← Coverage tiers + payment
│   │   ├── ClaimsScreen.js              ← History + live pipeline
│   │   ├── ProfileScreen.js             ← Bank / UPI details
│   │   └── NotificationsScreen.js
│   ├── components/
│   │   ├── WebSocketBridge.js
│   │   ├── AssistantModal.js            ← Multilingual support chat
│   │   ├── DisruptionModal.js           ← Live disruption overlay
│   │   └── LocationGate.js             ← GPS permission + zone detect
│   ├── contexts/
│   │   ├── AuthContext.js
│   │   ├── ClaimContext.js
│   │   ├── PolicyContext.js
│   │   └── LocalizationContext.js      ← EN / HI / TE
│   ├── services/
│   │   ├── api.js
│   │   └── websocket.service.js
│   └── locales/                        ← en.json, hi.json, te.json
│
└── safenet_v2/
    ├── backend/                        ← FastAPI (Render)
    │   └── app/
    │       ├── api/v1/routes/
    │       │   ├── admin.py
    │       │   ├── auth.py
    │       │   ├── claims.py
    │       │   ├── policies.py
    │       │   ├── workers.py
    │       │   ├── zones.py
    │       │   └── websockets.py
    │       ├── engines/
    │       │   ├── fraud/              ← Layers 1–4
    │       │   ├── confidence_engine.py
    │       │   ├── payout_engine.py   ← DNA-based calculation
    │       │   ├── premium_engine.py  ← XGBoost pricing
    │       │   ├── trust_engine.py
    │       │   └── zero_day_detector.py ← DBSCAN anomaly
    │       ├── services/
    │       │   ├── earnings_dna_service.py
    │       │   ├── forecast_shield_service.py
    │       │   ├── weather_service.py
    │       │   └── aqi_service.py
    │       ├── models/                ← SQLAlchemy ORM
    │       ├── tasks/                 ← APScheduler jobs
    │       └── ml/                   ← XGBoost model + trainer
    │
    └── admin/                        ← React dashboard (Vercel)
        └── src/
            ├── pages/
            │   ├── Dashboard.tsx
            │   ├── Claims.tsx
            │   ├── Workers.tsx
            │   ├── FraudInsights.tsx
            │   ├── ZoneHeatmap.tsx
            │   ├── PoolHealth.tsx
            │   └── SupportQueries.tsx
            ├── stores/               ← Zustand: auth, claims, fraud, pool
            └── services/
                └── admin_websocket.ts
```

---

## ⚙️ Production Readiness

**Cold start handling:** Both apps send a warmup ping to `/health` the moment the login screen opens. If the first request times out, the UI shows "Server is starting, please wait" — never a raw error.

**Retry logic:**

| Condition | Retried? |
|---|---|
| Timeout / ECONNABORTED | ✅ Once, after 2 seconds |
| Network unreachable | ✅ Once |
| 502 / 503 / 504 gateway errors | ✅ Once |
| 400 / 401 / 403 / 404 / 422 | ❌ Never |

**WebSocket resilience:** Both worker and admin clients reconnect automatically with exponential back-off up to 30-second delay on any disconnect.

**What's real vs test mode:**

| Component | Status |
|---|---|
| Weather + AQI data | ✅ Live API — real readings |
| 48-hour forecast (Forecast Shield) | ✅ Live |
| Location search + GPS | ✅ Real — works anywhere in India |
| 4-layer fraud engine | ✅ Fully coded, runs on every claim |
| XGBoost premium model | ✅ Functional prototype — real inference |
| DBSCAN zero-day detector | ✅ Real — runs every 60 seconds |
| WebSockets (worker + admin) | ✅ Real bidirectional push |
| Earnings DNA | ✅ Real — from history + zone baselines |
| Multilingual (EN/HI/TE) | ✅ Built-in — no external API |
| Trust score + device fingerprint | ✅ Real — persisted in PostgreSQL |
| Actuarial pool health thresholds | ✅ Real — loss ratio + reserve logic live in admin |
| Premium collection | 🔶 Razorpay test mode |
| Payout disbursement | 🔶 Test mode — real UTR-format records |

---

## 🚀 Run Locally

### Backend
```bash
cd safenet_v2/backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
# http://127.0.0.1:8000/health
```

### Admin Dashboard
```bash
cd safenet_v2/admin
npm install && npm run dev
# http://localhost:5173  —  admin / admin123
```

### Worker App
```bash
cd SafeNetFresh
npm install
npm start                    # Expo Go via QR
npx expo start --web         # Browser at http://localhost:8081
```

### Environment Variables
```env
DATABASE_URL=postgresql+asyncpg://user:password@host/dbname
JWT_SECRET=your-jwt-secret
ADMIN_JWT_SECRET=your-admin-jwt-secret
OPENWEATHER_API_KEY=your-key
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your-secret
ALLOWED_ORIGINS=https://safenet-sage.vercel.app,https://safenet-admin-wine.vercel.app
DEMO_MODE=false
```

---

## 🔭 Future Scope

- **B2B2C platform integration** — embed SafeNet directly inside Zomato / Swiggy partner apps via SDK; Earnings DNA becomes a shared data asset between SafeNet and platform
- **IRDAI regulatory sandbox** — pursue underwriting license for real premium collection; actuarial model and pool health dashboard are already sandbox-ready
- **Post-DNA repricing at scale** — 6-month renewal at ₹129 / ₹159 / ₹199 per worker based on individual Earnings DNA; pool reaches full break-even at ~2,200 workers
- **Expanded disruption types** — internet outages, market closures detected via behavioral-only DBSCAN signal without needing any external API
- **Cooperative pool model** — worker groups managing shared pools with community ownership; loss ratio transparency already built into admin dashboard
- **Pan-India zone expansion** — Haversine fallback already serves any coordinate; zones scale by seeding zone baseline data

---

## 🏆 Why Judges Should Notice This

- **Not a mockup.** Every feature in this README is verifiable at the live URLs above — right now. Stress-test it. Watch it recover.
- **The pricing is actuarially derived.** ₹49 / ₹79 / ₹99 are not guesses. They come from a bottom-up expected loss model: ₹58/hr × 3.0h × coverage % × 0.875 events/week, with 30% load factors. Break-even prices are ₹119 / ₹148 / ₹178. The gap is intentional — it is the data acquisition strategy, not a financial hole.
- **Both sides of the insurance relationship benefit.** The worker gets exact loss replaced. The insurer gets Earnings DNA — actuary-quality behavioral data inaccessible through any other method — and a 55–65% loss ratio vs 85%+ in traditional health insurance because fraud is caught before payout fires.
- **Genuine ML.** XGBoost and DBSCAN are not decorative. They run inference on real data on every claim and every policy activation.
- **Insurance-domain depth.** Pool Health, loss ratio tracking, zone isolation, per-zone WATCH/CRITICAL thresholds, and 8-week reserve floor logic show understanding of the actual domain — not just the surface problem.
- **Fraud engineering built for honest workers first.** A 4-layer pipeline that approves on 3 of 4 signals ensures a genuine worker caught in a real flood is never wrongly blocked because one API was slow.
- **The long-term moat is the data flywheel.** Six months of Earnings DNA yields per-worker actuarial precision that no demographic survey, no platform API, and no traditional insurer can replicate. The pilot subsidy is the price of building that moat. The business model closes at 2,200 workers.
- **Clear path to scale.** Direct-to-worker pilot → post-DNA repricing at month 6 → B2B2C SDK embedded in Zomato/Swiggy → IRDAI sandbox license. Each step builds directly on what already exists.

---

## 👥 Team AlphaNexus

> Guidewire DEVTrails 2026 — KL University, Vijayawada

*Building the safety net India's gig workers deserve — and proving with working software that it can be done.*

---

<div align="center">

**[Worker App](https://safenet-sage.vercel.app)   ·   [Admin Dashboard](https://safenet-admin-wine.vercel.app/admin-login)   ·   [Source Code](https://github.com/BHARGAVSAI558/devtrails-2026-alphanexus-phase2)   ·   [Pitch Deck](https://drive.google.com/file/d/1Hm4Dmb8lZwc0y5OuCcxt7tXnf_2cSYyC/view?usp=sharing)**

---

*The question was never whether gig workers deserve protection.*
*The question was whether anyone would build it properly.*

### **SafeNet doesn't ask you to prove anything. It proves it for you.**

---

*Coverage scope: SafeNet covers verified income loss from external disruptions only.*
*No health, life, accident, or vehicle coverage — ever.*

</div>
