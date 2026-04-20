<div align="center">

# SafeNet

### *"SafeNet doesn't ask you to prove anything. It proves it for you."*

**AI-powered parametric income protection for India's 15 million gig delivery workers.**

When rain, floods, heat, or shutdowns erase a day's earnings — SafeNet detects it, validates it, and pays exactly what was lost. Automatically. No form. No call. No waiting.

---

[![Phase](https://img.shields.io/badge/Guidewire_DEVTrails_2026-Phase_3_Final-1d4ed8?style=for-the-badge&logoColor=white)](https://github.com/BHARGAVSAI558/devtrails-2026-alphanexus-phase2)
[![Team](https://img.shields.io/badge/Team-AlphaNexus-7c3aed?style=for-the-badge)](https://github.com/BHARGAVSAI558/devtrails-2026-alphanexus-phase2)
[![Stack](https://img.shields.io/badge/Stack-FastAPI_+_Expo_+_PostgreSQL-16a34a?style=for-the-badge)](https://safenet-api-y4se.onrender.com/health)

</div>

---

## 🚀 Live — Try It Right Now

> **Backend runs on Render free tier.** First request may take 10–15 seconds to wake up.
> Both apps show *"Starting server… please wait"* during cold start — never a raw error.

| | Link |
|--|--|
| 📱 **Worker App** *(Highly Recommended)* | **[safenet-sage.vercel.app](https://safenet-sage.vercel.app)** |
| 🖥️ **Admin Dashboard** | **[safenet-admin-wine.vercel.app/admin-login](https://safenet-admin-wine.vercel.app/admin-login)** — `admin` / `admin123` *(auto-fills after 3.5s)* |
| 🔗 **Unified Entry + QR** | [safenet-admin-wine.vercel.app/login](https://safenet-admin-wine.vercel.app/login) |
| ⚙️ **Backend API** | [safenet-api-y4se.onrender.com](https://safenet-api-y4se.onrender.com) |
| ❤️ **Health Check** | [safenet-api-y4se.onrender.com/health](https://safenet-api-y4se.onrender.com/health) |
| 💻 **GitHub** | [devtrails-2026-alphanexus-phase2](https://github.com/BHARGAVSAI558/devtrails-2026-alphanexus-phase2) |
| 📊 **Pitch Deck** | [View on Google Slides](https://docs.google.com/presentation/d/1LhPPk7UFxfjY6dbjz6kf0PqrQdqvn945/edit?usp=sharing&ouid=116368085396987359147&rtpof=true&sd=true) |
| 🎬 **Demo Video** | *(link to be added before final submission)* |

---

## 📱 Scan to Open on Your Phone

> **Expo Go recommended for the best native experience.**
> Install Expo Go on your phone, then scan:

<div align="center">

![SafeNet QR Code](https://raw.githubusercontent.com/BHARGAVSAI558/devtrails-2026-alphanexus-phase2/main/assets/qr.png)

*Or open directly:* `exp://u.expo.dev/2d45889e-9415-4966-be7f-ba2711a57f13/group/278ac272-c5ef-40dc-beb2-25d1c58cae8e`

</div>

---

## ⚡ Evaluate SafeNet in 2 Minutes

### As a Worker — phone or browser

1. Open **[safenet-sage.vercel.app](https://safenet-sage.vercel.app)** — no install required
2. Enter any 10-digit mobile number → OTP animates digit-by-digit and auto-verifies in ~2 seconds
3. Select platform (Zomato / Swiggy / Other) → search any Indian city or tap GPS → select coverage tier
4. Dashboard loads with **live weather**, **real AQI**, **Earnings DNA heatmap**, zone risk level, and Forecast Shield status
5. Tap **"Simulate Disruption" → Heavy Rain** → watch the 6-step claim pipeline execute live → payout credited with the exact DNA formula shown: `₹58/hr × 3.0h × 0.8 = ₹139`

### As an Admin — simultaneously, on a laptop

1. Open **[safenet-admin-wine.vercel.app/admin-login](https://safenet-admin-wine.vercel.app/admin-login)**
2. Login: `admin` / `admin123` — credentials auto-fill after 3.5 seconds
3. Watch the worker's claim arrive **live in the dashboard feed via WebSocket** — no refresh needed
4. Navigate to Pool Health → view actuarial loss ratio, zone-by-zone reserve breakdown
5. Navigate to Support → see AI-prioritized worker tickets, sorted by urgency automatically

---

## 💡 The Problem

India has 15 million+ platform delivery workers — Zomato, Swiggy, Zepto, Blinkit, Amazon. They earn per trip. When disruptions hit, they earn nothing.

**Ravi, 26, Hyderabad.** He delivers for Zomato. On Thursday evenings he earns ₹58 an hour during the dinner rush. A flood alert hits at 8 PM — roads underwater, platform paused, zero orders. He loses 3 hours of peak income. ₹174 gone. There is no form to fill. No number to call. No system that catches him.

| Disruption | What Happens to the Worker |
|---|---|
| Heavy rain / floods | Roads unsafe. Platform pauses orders. Zero income. |
| Extreme heat above 42°C | Health risk. Forced to go offline. |
| AQI above 300 | Hazardous outdoor exposure. Platform restricts zones. |
| Curfews / local strikes | Zone completely locked. No pickup or delivery possible. |
| Platform outages | Orders stop assigning. Worker is ready. Platform isn't. |

Traditional insurance covers accidents — not lost daily wages. Government schemes (PMSBY, ESIC) explicitly exclude informal gig workers. Every existing product either demands proof workers cannot provide, or pays a flat ₹300–500 that has nothing to do with what they actually lost.

**The gap in one sentence:** no system today answers the question of *what a specific worker lost at a specific time* — and proves it without asking them to prove it.

---

## 🎯 Why SafeNet Wins

```
Every other system:  disruption happens → pay a fixed ₹500 to everyone
SafeNet:             learn this worker's earning reality → pay exactly what they lost
```

| What Others Do | What SafeNet Does |
|---|---|
| Flat payout disconnected from actual loss | Personalized payout from individual Earnings DNA |
| React after the worker files a claim | Detect, validate, and credit — before worker knows |
| Demand proof the worker cannot provide | Pull verification from 4 independent data signals |
| Treat all workers in a zone identically | Individual risk pricing via XGBoost ML model |
| Single static coverage tier | Forecast Shield auto-upgrades tier before disruption hits |

---

## 🧬 Core Innovation — Earnings DNA

Every other system pays ₹300 or ₹500 when disruption happens. This is arbitrary.

SafeNet builds a **7×24 earning fingerprint** for every worker — expected hourly rate for every day-of-week and hour combination, learned from their own delivery history.

```
Ravi's Earnings DNA — Zomato / Hyderabad / Banjara Hills Zone
──────────────────────────────────────────────────────────────
           6AM  8AM  10AM  12PM  2PM  4PM  6PM  8PM  10PM
Monday   [  ░    ▒    ▒     ▓    ▓    ▒    ▒    ▓    ▒  ]
Thursday [  ░    ▒    ▒     ▓    ▓    ▒    ▓    █    ▓  ]  ← Peak 7–10 PM
Sunday   [  ░    ▒    ▓     █    █    ▒    ▒    ▓    ░  ]  ← Peak 12–2 PM
──────────────────────────────────────────────────────────────
░ low   ▒ moderate   ▓ active   █ peak earning window
```

**When flood hits at 8 PM Thursday:**
```
Payout = DNA rate (₹58/hr) × disruption hours (3.0) × coverage multiplier (0.8) = ₹139
```
Not ₹500 for everyone. The exact amount Ravi lost on Thursday evening.

For new workers without history: zone baseline rates apply immediately. The DNA matrix grows more precise with every data point.

---

## 🛡️ Forecast Shield — Protection That Anticipates

Standard insurance reacts to disruptions after they happen. SafeNet reads the 48-hour weather forecast every 6 hours and **auto-upgrades coverage before the risk window arrives** — at no extra cost.

```
18 hours before the disruption:
  OpenWeatherMap forecast → heavy rain predicted 3 PM–7 PM, 82% confidence
  Action: coverage auto-upgraded to Pro tier for that window
  Worker push notification: "Forecast Shield Active — you're already protected"

When the disruption hits:
  Payout fires at the upgraded Pro tier automatically
  Worker sees: "SafeNet predicted this 18 hours ago and upgraded your cover"
```

No other parametric insurance product does this. The system moves first.

---

## 🔄 Zero-Touch Claim Pipeline

From disruption detection to payout, the worker does nothing.

```
APScheduler — every 30 minutes, 6 AM–11 PM IST
                    │
                    ▼
       ┌────────────────────────────┐
       │      Confidence Engine     │
       │  OpenWeatherMap — live     │
       │  OpenAQ — real AQI         │
       │  → HIGH / MIXED / LOW      │
       └────────────┬───────────────┘
               HIGH │
                    ▼
       ┌────────────────────────────┐
       │      Behavioral Engine     │
       │  GPS trail vs baseline     │
       │  → deviation score 0–100   │
       └────────────┬───────────────┘
           deviation > threshold
                    ▼
       ┌────────────────────────────┐
       │    4-Layer Fraud Pipeline  │
       │  → CLEAN / FLAG / BLOCK    │
       └────────────┬───────────────┘
               CLEAN │
                    ▼
       ┌────────────────────────────┐
       │      Decision Engine       │
       │  All signals + trust score │
       │  → APPROVE / REJECT        │
       └────────────┬───────────────┘
            APPROVE │
                    ▼
       ┌────────────────────────────┐
       │      Payout Engine         │
       │  DNA × hours × multiplier  │
       │  Razorpay record + UTR     │
       │  WebSocket → worker + admin│
       └────────────────────────────┘
```

**What the worker sees in real time:**
```
🌧 Disruption Detected  →  📍 Verifying Signals  →  🛡 Fraud Check  →  ✅ Decision  →  ₹ Credited
```
Every step animates live. Zero action required.

---

## 🕵️ 4-Layer Fraud Defense

The attack vector: 500 workers fake GPS inside a flood zone, mass-claim, drain the pool. SafeNet runs four independent layers before any payout clears.

```
LAYER 4 — Enrollment Timing Anomaly
  Mass sign-ups before a predicted storm? → Elevated scrutiny on all zone accounts
              ↓
LAYER 1 — GPS Signal Integrity
  Teleportation: 3 km in under 20 seconds → FLAG
  Static spoof: GPS variance exactly zero → FLAG
  Cell tower mismatch: tower in different district than GPS → FLAG
              ↓
LAYER 2 — Cross-Signal Corroboration (4 independent sources)
  S1: Worker GPS inside disrupted zone?
  S2: Weather/AQI APIs confirm active disruption at that location?
  S3: App activity low/absent during the disruption window?
  S4: Platform order volume dropped in the zone?
  4/4 → APPROVE   3/4 → APPROVE + log   2/4 → FLAG   1/0 → BLOCK
              ↓
LAYER 3 — Fraud Ring Detection (DBSCAN cluster analysis)
  Zone density: 8+ flagged claims from same zone in 1 hour?
  Timestamp sync: 5+ submissions within a 3-minute window?
  Pattern homogeneity: identical inactivity durations across workers?
  All three → CONFIRMED ring → freeze cluster → admin alert instantly
```

**Honest-worker-first principle:** 3 of 4 cross-signals still approves. A temporary API delay during a real flood should never punish a genuine worker. SafeNet delays before it denies.

---

## 🤖 AI & ML Systems

| Engine | Implementation | Status |
|---|---|---|
| **XGBoost Premium Pricing** | Trained on zone risk (flood/heat/AQI history), worker trust score, claim history, seasonal multipliers | ✅ Functional prototype |
| **Behavioral Deviation Engine** | GPS trail baseline per worker; deviation score 0–100 on every disruption event | ✅ Live |
| **DBSCAN Zero-Day Detector** | scikit-learn clustering on worker GPS + offline timestamps every 60 seconds; detects novel disruptions not in any weather API | ✅ Live |
| **AI Ticket Priority Scoring** | Keyword pattern analysis on every support ticket; surfaces payment/safety complaints above cosmetic queries automatically | ✅ Live |
| **Trust Score Engine** | Dynamic 0–100 score updated after every claim and premium event; feeds fraud weighting and payout speed | ✅ Live |
| **Earnings DNA Service** | 7×24 personal rate matrix built from claim history + calibrated zone baselines | ✅ Live |
| **Forecast Shield Service** | 48-hour OpenWeatherMap forecast checked every 6 hours; auto-upgrades policy tier in advance | ✅ Live |

---

## 💳 Coverage Tiers & Dynamic Pricing

| Tier | Weekly Premium | Weekly Protection Cap |
|---|---|---|
| Basic | ₹49 / week | Up to ₹600 |
| Standard | ₹79 / week | Up to ₹800 |
| Pro | ₹99 / week | Up to ₹1,100 |

Premiums are not flat rates. The XGBoost model recalculates each worker's premium every Monday at 12 AM based on zone risk level, personal trust score (0–100), claim history, and seasonal patterns. A worker in a flood-prone zone pays more than one in an elevated zone. A worker with a clean track record earns a loyalty discount over time. Each zone maintains its own pool — zone isolation is a fairness guarantee, not just a technical boundary.

**Trust Score payout speed:**

| Score | Level | Payout Processing |
|---|---|---|
| 91–100 | Elite ⚡ | Instant |
| 71–90 | Trusted | 30 seconds |
| 41–70 | Reliable | 2 minutes |
| 0–40 | Emerging | Manual review queue |

---

## 🔐 Security Architecture

- **OTP login:** 6-digit code with animated digit-by-digit display; demo-safe in DEMO_MODE, real SMS logic in production
- **JWT token pair:** Access + refresh tokens; silent renewal without re-login
- **SHA-256 canonical identity:** Phone number hashed to prevent duplicate payouts across multiple platform accounts on the same device
- **Device fingerprinting:** Hardware fingerprint stored on first login; new device triggers elevated fraud scrutiny
- **HMAC payment verification:** All Razorpay callbacks verified cryptographically server-side before any policy activates
- **Rate limiting:** Per-IP limits on OTP send, login, and claim submission endpoints

---

## ⚡ Real-Time Architecture

Both worker app and admin dashboard receive live updates via WebSocket — no polling, no refresh.

- **Worker channel** `/ws/worker/{id}`: Disruption alerts, claim pipeline step updates, payout credits, Forecast Shield activations, admin support replies
- **Admin channel** `/ws/admin`: Multiplexed feed of claim events, fraud flags, zone alerts, and pool health data on a single connection
- **Reconnection:** Both clients reconnect automatically with exponential back-off up to 30 seconds on any disconnect
- **Live claim feed:** New claims appear in the admin dashboard within seconds of pipeline completion, merged with DB-fetched history at the top of the list

---

## 🖥️ Admin Dashboard

A functional operations center — all data from live database queries, all updates via WebSocket.

| Page | What It Shows |
|---|---|
| **Dashboard** | Live KPIs: active workers, claims today, fraud blocked, pool utilization — all from database |
| **Pool Health** | Loss ratio gauge (target <65%), reserve balance, per-zone premium vs payout breakdown, WATCH/CRITICAL zone alerts |
| **Zone Map** | Leaflet map — 26 zones colored by risk level, sized by worker count, click for zone stats |
| **Claims** | Live WebSocket stream — new claims appear within seconds, merged with DB history |
| **Fraud Insights** | Fraud queue with per-layer breakdown, DBSCAN zero-day alert panel, score distribution chart |
| **Workers** | Searchable registry with trust score bars, tier badges, full profile on click |
| **Simulations** | Trigger any disruption scenario from admin side — inspect full pipeline output |
| **Support** | AI-prioritized ticket queue, reply interface, resolve/open toggle, multilingual display |

---

## 💬 Multilingual Support Assistant

A floating assistant accessible from every screen — no navigation required.

- **Languages:** English / हिंदी / తెలుగు — built-in locale files, no external translation API
- **Smart queries:** "Why didn't I get paid?", "What is my claim status?", "Is there a disruption now?" — context-aware answers from live account data
- **Ticket flow:** Worker submits issue → unique ticket ID (TKT-000001) generated → appears in admin queue with AI-assigned priority score
- **Admin reply loop:** Admin replies in dashboard → pushed to worker via WebSocket → instant push notification
- **Voice input:** Browser SpeechRecognition API with locale matching current language (`en-IN` / `hi-IN` / `te-IN`); graceful fallback to text where unsupported

---

## 🏗️ System Architecture

```
┌─────────────────────────────┐       ┌─────────────────────────────┐
│       Worker App            │       │      Admin Dashboard         │
│  safenet-sage.vercel.app    │       │  safenet-admin-wine.vercel   │
│                             │       │                             │
│  React Native + Expo Web    │       │  React + Vite + TypeScript  │
│  WebSocket client           │       │  Tailwind + Recharts        │
│  expo-location (GPS)        │       │  Leaflet maps + Zustand     │
└──────────────┬──────────────┘       └──────────────┬──────────────┘
               │   HTTPS + WSS                       │   HTTPS + WSS
               └──────────────────┬──────────────────┘
                                  ▼
               ┌──────────────────────────────────────┐
               │           FastAPI Backend             │
               │     safenet-api-y4se.onrender.com     │
               │                                      │
               │   Auth · Zones · Workers             │
               │   Policies · Claims · Admin          │
               │   /ws/worker/{id} · /ws/admin        │
               │                                      │
               │   Engines: Confidence · Fraud (L1–4) │
               │   Premium (XGBoost) · Payout · DNA   │
               │   ZeroDay (DBSCAN) · Trust · Risk    │
               └────────────────┬─────────────────────┘
                                │
          ┌─────────────────────┼──────────────────────┐
          ▼                     ▼                      ▼
   ┌────────────┐       ┌─────────────┐       ┌───────────────────┐
   │ PostgreSQL │       │ APScheduler │       │  External APIs    │
   │  (Render)  │       │  every 30m  │       │                   │
   │            │       │             │       │ OpenWeatherMap    │
   │  Workers   │       │  Disruption │       │ OpenAQ (AQI)      │
   │  Policies  │       │  detection  │       │ Nominatim / OSM   │
   │  Claims    │       │  Premium    │       │ Razorpay (test)   │
   │  Zones     │       │  renewal    │       │ Expo Notifications│
   │  Pool      │       │  DBSCAN     │       │                   │
   └────────────┘       └─────────────┘       └───────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Worker App | React Native, Expo, Expo Web — single codebase for iOS, Android, browser |
| Admin Dashboard | React, Vite, TypeScript, Tailwind CSS, Recharts, Leaflet, Zustand |
| Backend | FastAPI, Python, SQLAlchemy, Alembic, PostgreSQL |
| ML / AI | XGBoost (premium pricing), scikit-learn DBSCAN (anomaly detection) |
| Real-time | WebSockets (FastAPI native), APScheduler background jobs |
| Security | JWT access + refresh tokens, SHA-256 canonical identity, device fingerprinting, HMAC verification, per-IP rate limiting |
| Location | Nominatim / OpenStreetMap (search + reverse geocode), expo-location (GPS), Haversine (zone matching) |
| External APIs | OpenWeatherMap (live + 48h forecast), OpenAQ (live AQI PM2.5), Razorpay (test mode) |
| PDF | fpdf2 — claim receipts with formula, API sources, Razorpay reference |
| i18n | Custom LocalizationContext + en.json, hi.json, te.json |
| Deployment | Render (backend + PostgreSQL), Vercel (admin + worker web app) |

---

## ✅ What's Real vs Test Mode

| Component | Status | Detail |
|---|---|---|
| Weather data | ✅ Live | OpenWeatherMap API — real current readings |
| 48-hour weather forecast | ✅ Live | Powers Forecast Shield auto-upgrades |
| AQI data | ✅ Live | OpenAQ API — real PM2.5 values per zone |
| Location search | ✅ Real | Nominatim / OSM — works anywhere in India, no API key |
| GPS detection | ✅ Real | expo-location + Haversine backend zone matching |
| OTP system | ✅ Real (demo-safe) | Animated digit-by-digit auto-fill; any 6 digits accepted in DEMO_MODE |
| 4-layer fraud engine | ✅ Fully coded | All layers execute on every claim event |
| DBSCAN zero-day detector | ✅ Real | scikit-learn clustering running every 60 seconds |
| XGBoost premium model | ✅ Real | Trained model running inference on every policy activation |
| Behavioral deviation engine | ✅ Real | GPS baseline scoring on every disruption event |
| WebSockets | ✅ Real | Bidirectional live push — worker + admin multiplexed |
| Earnings DNA | ✅ Real | 7×24 matrix from claim history + calibrated zone baselines |
| Forecast Shield | ✅ Real | 48h forecast → auto tier upgrade → stored on policy record |
| Trust score engine | ✅ Real | Dynamic update after every claim and premium event |
| SHA-256 canonical identity | ✅ Real | Enforced at claim deduplication level |
| AI ticket priority scoring | ✅ Real | Keyword pattern analysis on every submission |
| Push notifications | ✅ Real | Expo Notifications (native) + browser Notification API (web) |
| PDF receipts | ✅ Real | fpdf2 — generated with actual claim data, formula, and Razorpay ref |
| Multilingual support | ✅ Real | Built-in EN / HI / TE — no external translation API |
| Device fingerprinting | ✅ Real | Hardware fingerprint stored and checked per login |
| HMAC payment verification | ✅ Real | Server-side cryptographic signature validation |
| Premium collection | 🔶 Test mode | Razorpay Checkout — real flow, no real money moved |
| Payout disbursement | 🔶 Test mode | Razorpay test records with real UTR-format reference numbers |

---

## ⚙️ Production Reliability

**Cold start handling:** Render free tier sleeps after inactivity. Both apps send a background warmup ping to `/health` the moment the login screen opens. If the first request times out, the UI shows "Server is starting, please wait" — never a raw error.

**Retry logic:**

| Condition | Retried? |
|---|---|
| Timeout / ECONNABORTED | ✅ Once, after 2 seconds |
| Network unreachable | ✅ Once |
| 502 / 503 / 504 gateway errors | ✅ Once |
| 400 / 401 / 403 / 404 / 422 | ❌ Never — these are deterministic |

**WebSocket resilience:** Both clients reconnect with exponential back-off up to 30-second maximum delay on any disconnect.

---

## 📁 Project Structure

```
devtrails-2026-alphanexus-phase2/
│
├── SafeNetFresh/                        ← Expo worker app (mobile + web)
│   ├── screens/
│   │   ├── OnboardingScreen.js          ← Phone entry + OTP send
│   │   ├── OTPVerifyScreen.js           ← Animated auto-fill + verify
│   │   ├── ProfileSetupScreen.js        ← 5-step onboarding wizard
│   │   ├── DashboardScreen.js           ← Live weather, AQI, DNA heatmap
│   │   ├── PolicyScreen.js              ← Coverage tiers + payment
│   │   ├── ClaimsScreen.js              ← History + live pipeline
│   │   ├── ProfileScreen.js             ← Bank / UPI details
│   │   └── NotificationsScreen.js       ← Push notification history
│   ├── components/
│   │   ├── WebSocketBridge.js
│   │   ├── AssistantModal.js            ← Multilingual support chat
│   │   ├── DisruptionModal.js           ← Live disruption alert overlay
│   │   └── LocationGate.js              ← GPS permission + zone detect
│   ├── contexts/
│   │   ├── AuthContext.js
│   │   ├── ClaimContext.js
│   │   ├── PolicyContext.js
│   │   └── LocalizationContext.js       ← EN / HI / TE
│   ├── services/
│   │   ├── api.js
│   │   └── websocket.service.js
│   └── locales/                         ← en.json, hi.json, te.json
│
└── safenet_v2/
    ├── backend/                         ← FastAPI (Render)
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
    │       │   ├── fraud/               ← Layer 1–4 pipeline
    │       │   ├── confidence_engine.py
    │       │   ├── payout_engine.py     ← DNA-based calculation
    │       │   ├── premium_engine.py    ← XGBoost pricing
    │       │   ├── trust_engine.py
    │       │   └── zero_day_detector.py ← DBSCAN anomaly detection
    │       ├── services/
    │       │   ├── earnings_dna_service.py
    │       │   ├── forecast_shield_service.py
    │       │   ├── weather_service.py
    │       │   └── aqi_service.py
    │       ├── models/                  ← SQLAlchemy ORM
    │       ├── tasks/                   ← APScheduler jobs
    │       └── ml/                      ← XGBoost model + trainer
    │
    └── admin/                           ← React dashboard (Vercel)
        └── src/
            ├── pages/
            │   ├── Dashboard.tsx
            │   ├── Claims.tsx
            │   ├── Workers.tsx
            │   ├── FraudInsights.tsx
            │   ├── ZoneHeatmap.tsx
            │   ├── PoolHealth.tsx
            │   └── SupportQueries.tsx
            ├── stores/                  ← Zustand: auth, claims, fraud, pool
            └── services/
                └── admin_websocket.ts
```

---

## 🚀 Run Locally

### Backend
```bash
cd safenet_v2/backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
# Health check: http://127.0.0.1:8000/health
```

### Admin Dashboard
```bash
cd safenet_v2/admin
npm install && npm run dev
# Opens at http://localhost:5173 — login: admin / admin123
```

### Worker App
```bash
cd SafeNetFresh
npm install
npm start                    # Expo Go via QR on local network
npm run start:tunnel         # Phone on cellular or different network
npx expo start --web         # Browser at http://localhost:8081
```

### Environment Variables (backend `.env`)
```env
DATABASE_URL=postgresql+asyncpg://user:password@host/dbname
JWT_SECRET=your-jwt-secret
ADMIN_JWT_SECRET=your-admin-jwt-secret
OPENWEATHER_API_KEY=your-openweathermap-key
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your-razorpay-secret
ALLOWED_ORIGINS=https://safenet-sage.vercel.app,https://safenet-admin-wine.vercel.app
DEMO_MODE=false
```

---

## 🔭 Future Scope

- **B2B2C platform integration:** Embed SafeNet coverage directly inside Zomato / Swiggy partner apps via SDK
- **IRDAI regulatory sandbox:** Pursue sandbox underwriting license for real premium collection at scale
- **Cooperative pool model:** Allow worker groups to collectively manage a shared pool, building community ownership
- **Expanded disruption types:** Political violence, market closures, internet outages via behavioral-only DBSCAN signal
- **DNA data flywheel:** Six months of usage yields per-worker actuarial precision better than any demographic model
- **Pan-India zone coverage:** Current MVP covers 26 zones across 6 cities; Haversine fallback already serves anywhere

---

## 🏆 Why Judges Should Notice This

- **Not a mockup.** Every section of this README describes something that runs in production today — verifiable via the health endpoint and live demo.
- **Genuine ML.** XGBoost and DBSCAN are not decorative — they run inference on real data on every claim and every policy activation.
- **Insurance-domain aware.** Pool Health, loss ratio tracking, zone isolation, and actuarial reserve logic show understanding of the actual domain, not just the surface problem.
- **Fraud engineering.** A 4-layer pipeline with a formal honest-worker-first principle is not standard hackathon work.
- **Behavioral data flywheel.** Earnings DNA accumulates actuary-quality worker data that traditional insurers cannot access by any other method — this is the long-term competitive moat.
- **Production reliability.** Cold start handling, retry logic, WebSocket reconnection, and graceful degradation are all implemented — judges can break it and watch it recover.
- **Clear path to scale.** Direct-to-worker → embedded B2B2C → IRDAI sandbox. Each step builds on what already exists.

---

## 👥 Team AlphaNexus

> Guidewire DEVTrails 2026 — KL University, Vijayawada

*Building the safety net India's gig workers deserve — and proving with working software that it can be done.*

---

<div align="center">

**[Try the live app](https://safenet-sage.vercel.app)   ·   [Admin dashboard](https://safenet-admin-wine.vercel.app/admin-login)   ·   [Source code](https://github.com/BHARGAVSAI558/devtrails-2026-alphanexus-phase2)**

---

*The question was never whether gig workers deserve protection.*
*The question was whether anyone would build it properly.*

**SafeNet doesn't ask you to prove anything. It proves it for you.**

---

*Coverage scope: SafeNet covers verified loss of income from external disruptions only.
No health, life, accident, or vehicle coverage — ever.*

</div>
