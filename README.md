# 🛡️ SafeNet — AI Income Protection for Gig Workers

> **Guidewire DevTrails 2026 — Phase 3 Final** | Team AlphaNexus
>
> *"SafeNet doesn't ask you to prove anything. It proves it for you."*

---

## 🚀 Live Demo

| | URL |
|--|--|
| 📱 **Worker App** (Highly Recommended) | **[https://safenet-sage.vercel.app](https://safenet-sage.vercel.app)** |
| 🔗 **Unified Entry** | **[https://safenet-admin-wine.vercel.app/login](https://safenet-admin-wine.vercel.app/login)** |
| 🖥️ **Admin Dashboard** | **[https://safenet-admin-wine.vercel.app/admin-login](https://safenet-admin-wine.vercel.app/admin-login)** |
| ⚙️ **Backend API** | [https://safenet-api-y4se.onrender.com](https://safenet-api-y4se.onrender.com) |
| ❤️ **Health Check** | [https://safenet-api-y4se.onrender.com/health](https://safenet-api-y4se.onrender.com/health) |
| 💻 **GitHub** | [devtrails-2026-alphanexus-phase2](https://github.com/BHARGAVSAI558/devtrails-2026-alphanexus-phase2) |

> **Note:** Backend is hosted on Render free tier — first request may take 10–15 seconds to wake up. The app shows "Starting server… please wait" during this time.

---

## ⚡ 2-Minute Judge Demo Flow

### As a Worker (phone or browser):

1. Open **[https://safenet-sage.vercel.app](https://safenet-sage.vercel.app)**
2. Enter any 10-digit mobile number → OTP auto-fills in ~2 seconds (animated digit-by-digit) → auto-verifies
3. Select platform (Zomato / Swiggy / Other) → search your delivery area or tap GPS → coverage tier
4. Dashboard shows **live weather**, **real AQI**, **your Earnings DNA heatmap**, and zone risk
5. Tap **"Simulate disruption"** → pick Heavy Rain → watch the 6-step claim pipeline execute live → see payout amount credited

### As an Admin (same time, on laptop):

1. Open **[https://safenet-admin-wine.vercel.app/admin-login](https://safenet-admin-wine.vercel.app/admin-login)**
2. Login: `admin` / `admin123` (auto-fills after 3.5s)
3. Watch the claim from step 5 above arrive **live in the dashboard feed** via WebSocket — no refresh needed

**QR code available** on the unified entry page for direct mobile Expo Go access.

---

## 💡 The Problem We Solve

India has 15M+ platform delivery workers (Zomato, Swiggy, Zepto, Amazon, Blinkit). They earn per trip, not per month. When external disruptions hit, they have no fallback:

| Disruption | Impact |
|-----------|--------|
| Heavy rain | Roads unsafe, order cancellations surge |
| Extreme heat >42°C | Health risk, forced to go offline |
| AQI >300 | Hazardous outdoor exposure |
| Curfews / strikes | Zone completely locked |
| Platform outages | Zero orders despite availability |

Traditional insurance ignores them. Government schemes exclude informal workers. Every existing system either demands proof the worker cannot provide, or pays a flat amount disconnected from their actual loss.

---

## 🎯 What SafeNet Does Differently

```
Every other system:   disruption happens → pay a fixed flat amount
SafeNet:              learn each worker's earning reality → pay what they actually lost
```

**The core insight:** Ravi works Thursday evenings and earns ₹87/hour during that window. When flooding hits at 8 PM Thursday, the right payout is ₹87 × disruption hours — not a generic ₹500 everyone gets. SafeNet builds this personal earning fingerprint automatically from the worker's own history.

---

## 🧬 Earnings DNA — Core Innovation

Every worker gets a personal 7×24 earning matrix that captures their real income pattern by day and hour.

```
           6A  8A  10A  12P  2P  4P  6P  8P  10P
Monday   [ ░   ▒   ▒   ▓   ▓   ▒   ▒   ▓   ▒  ]
Tuesday  [ ░   ▒   ▒   ▓   ▓   ▒   ▓   █   ▒  ]
Wednesday[ ░   ▒   ▒   ▓   ▒   ▒   ▒   ▓   ▒  ]
Thursday [ ░   ▒   ▒   ▓   ▓   ▒   ▓   █   ▓  ] ← Peak 7–10 PM
Friday   [ ░   ▒   ▒   ▓   ▓   ▒   ▓   █   ▒  ]
Saturday [ ░   ▒   ▓   █   ▓   ▒   ▓   █   ▒  ]
Sunday   [ ░   ▒   ▓   █   █   ▒   ▒   ▓   ░  ] ← Peak 12–2 PM

░ low   ▒ medium   ▓ high   █ peak
```

**Payout formula:** `DNA hourly rate × disruption hours × coverage multiplier`, capped at tier maximum.

For new workers: zone baseline rates apply (₹80–₹120/hr by risk level) until enough claim history accumulates.

---

## 💳 Coverage Tiers

| Tier | Weekly Premium | Protected Amount |
|------|---------------|-----------------|
| Basic | ₹49/week | Up to ₹600 |
| Standard | ₹79/week | Up to ₹800 |
| Pro | ₹99/week | Up to ₹1,100 |

Workers select a plan during onboarding and can change it later before payment. Premiums are dynamically adjusted by zone risk and worker trust score via XGBoost ML model.

---

## 🛡️ Forecast Shield — Proactive Protection

SafeNet checks the 48-hour weather forecast every 6 hours. When elevated risk is predicted, coverage auto-upgrades **before** the disruption hits — at no extra cost to the worker.

```
18 hours before:
  System detects heavy rain predicted tomorrow 3 PM–7 PM (82% confidence)
  Action: coverage tier auto-upgraded to Pro for that window
  Worker notified: "Forecast Shield Active — you're already protected"

During disruption:
  Payout calculated at upgraded Pro tier automatically
  Message: "SafeNet predicted this 18 hours ago and upgraded your cover"
```

---

## 🔄 Zero-Touch Claim Pipeline

No forms. No proof. No calls. The worker does nothing.

```
Background Scheduler (every 30 min, 6 AM–11 PM IST)
         │
         ▼
Confidence Engine — Weather + AQI + Social alerts → HIGH / MIXED / LOW
         │ HIGH
         ▼
Behavioral Engine — GPS trail vs baseline → deviation score 0–100
         │ deviation > threshold
         ▼
Fraud Pipeline — 4 layers → CLEAN / FLAGGED / BLOCK
         │ CLEAN
         ▼
Decision Engine — All signals + trust score → APPROVE / REJECT
         │ APPROVE
         ▼
Payout Engine — DNA-based calculation → ₹ amount determined
         │
         ▼
Razorpay payout recorded + WebSocket push to worker app + admin dashboard
```

**What the worker sees in real time:**

```
Disruption Detected ● → Verifying Signals ● → Fraud Check ● → Decision ● → ₹ Credited ●
```

---

## 🕵️ 4-Layer Fraud Engine

Stops coordinated spoofing rings before any payout is processed.

```
LAYER 4 — Enrollment Timing Anomaly
  Mass sign-ups detected before a predicted storm → elevated scrutiny applied
              ↓
LAYER 1 — GPS Signal Integrity
  Teleportation check (3 km in 20 sec?)
  Static spoof check (variance exactly zero = machine GPS)
  Cell tower mismatch validation
              ↓
LAYER 2 — Cross-Signal Corroboration (4 independent signals)
  S1: Is worker GPS inside disrupted zone?
  S2: Do weather/AQI APIs confirm active disruption?
  S3: Is app activity low/absent (not working)?
  S4: Did platform order volume drop in this zone?
  4/4 → APPROVE · 3/4 → APPROVE · 2/4 → FLAG · 1/4 → BLOCK
              ↓
LAYER 3 — Fraud Ring Detection (DBSCAN-style cluster analysis)
  Zone density spike (8+ flagged claims in 1 hour)
  Timestamp synchrony (5+ submissions within 3 minutes)
  Pattern homogeneity (identical inactivity durations)
  → CONFIRMED ring → freeze cluster payouts → admin alert
```

**Honest-worker-first principle:** 3 of 4 signals still approves. A temporary API delay should never punish a genuine worker.

---

## 🤖 AI Risk Scoring & Priority Scoring

- **XGBoost premium model** trained on zone risk, worker history, weather patterns, and trust score
- **Priority scoring** on support tickets — high-urgency tickets (payment, safety) surface first in admin queue
- **Zero-day detector** — mass offline events detected via DBSCAN anomaly detection; admin alerted before claims are processed
- **Trust engine** — per-worker trust score updated after each claim; high-trust workers get faster approvals

---

## 📍 Location System

Workers search any place in India (powered by Nominatim / OpenStreetMap — no API key restrictions) or use device GPS. Location is reverse-geocoded and matched to the nearest SafeNet zone using the Haversine formula.

- Search "Gachibowli" → suggestions appear as you type → select → zone + risk level shown instantly
- "Detect my location" → device GPS → reverse geocode → zone assigned
- If no zone found within 50 km: nearest available zone auto-assigned with a notification

---

## 🔐 Authentication & Security

- **OTP-based auth** — 6-digit code, demo-safe (any 6 digits accepted in DEMO_MODE)
- **JWT tokens** — access + refresh token pair, stored securely per platform
- **Returning users** — after OTP login, profile and plan are detected automatically; dashboard loads directly without re-onboarding
- **Device fingerprinting** — hardware fingerprint stored per worker for fraud correlation
- **Rate limiting** — per-IP limits on sensitive endpoints

---

## 💬 Support Assistant — Multilingual

Floating assistant accessible from every screen.

- **Predefined queries:** Why didn't I get paid? What is my claim status? Is there a disruption now?
- **Raise Ticket:** generates unique ticket ID (TKT-000001), tracked in admin queue
- **Languages:** English / हिंदी / తెలుగు — all built-in, no external translation API
- **Voice input:** browser Speech Recognition (Chrome/Edge on web); graceful text fallback in Expo Go
- **Admin reply loop:** admin responds from dashboard → reply pushed to worker's chat via WebSocket → notification triggered

---

## 🔔 Notifications

- Push notifications via Expo Notifications (native) and browser Notification API (web)
- Real-time WebSocket push for claim updates, payout credits, disruption alerts
- Admin can send replies to worker support tickets; worker receives notification instantly

---

## 💰 Payments

Workers add their bank account (holder name, IFSC, account number) or UPI ID in their Profile. Approved payouts are recorded via Razorpay test mode and linked to the claim record with payout ID and status.

- UPI deep-link opens native UPI app on mobile
- Card and netbanking flows available in-app
- All payment records stored in PostgreSQL with full audit trail

---

## 🖥️ Admin Dashboard

| Page | What it shows |
|------|--------------|
| Dashboard | Live KPIs: active workers, claims today, fraud blocked, pool utilization %, weekly premiums vs paid out |
| Zone Heatmap | All zones on map — color by risk level, size by worker count, click for zone stats |
| Fraud Insights | Fraud queue with layer breakdown, score distribution chart, enrollment vs weather signal timeline |
| Workers | Searchable registry — trust score, tier, premium, claims count, fraud flags; click any worker for full profile + claim history |
| Claims | Live claim feed from pipeline — real-time WebSocket updates + DB fallback |
| Simulations | Run any disruption scenario from admin side and inspect pipeline outcomes |
| Support | All user tickets with admin reply interface, resolve/open status toggle, multilingual messages |

---

## 🏗️ Architecture

```
┌──────────────────────────┐    ┌──────────────────────────┐
│   Worker App             │    │   Admin Dashboard         │
│   safenet-sage.vercel.app│    │   safenet-admin-wine      │
│                          │    │   .vercel.app             │
│  React Native + Expo Web │    │   React + TypeScript      │
│  WebSocket client        │    │   WebSocket client        │
└──────────┬───────────────┘    └──────────┬────────────────┘
           │ HTTPS + WSS                   │ HTTPS + WSS
           └──────────────┬────────────────┘
                          ▼
           ┌──────────────────────────────┐
           │   FastAPI Backend            │
           │   safenet-api-y4se.onrender  │
           │                              │
           │  /api/v1/auth  /api/v1/zones │
           │  /api/v1/workers             │
           │  /api/v1/policies            │
           │  /api/v1/claims              │
           │  /ws/worker/{id}  /ws/admin  │
           └──┬────────────┬─────────────┘
              │            │
        ┌─────▼──┐   ┌─────▼──────────────────┐
        │Postgres│   │ External APIs           │
        │        │   │ OpenWeatherMap (live)   │
        │Workers │   │ OpenAQ (live AQI)       │
        │Policies│   │ Razorpay (test mode)    │
        │Claims  │   │ APScheduler (30-min)    │
        └────────┘   └────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Worker App | React Native, Expo, Expo Web |
| Admin Dashboard | React, Vite, TypeScript, Tailwind CSS, Recharts, Leaflet |
| Backend | FastAPI, Python, SQLAlchemy, Alembic, PostgreSQL |
| ML | XGBoost, scikit-learn — dynamic premium model |
| Real-time | WebSockets, Redis pub/sub |
| Location | Nominatim / OpenStreetMap (search + reverse geocode), expo-location (GPS) |
| External APIs | OpenWeatherMap (weather + forecast), OpenAQ (live AQI), Razorpay test |
| Background Jobs | APScheduler — zone polling every 30 min, 6 AM–11 PM IST |
| Deployment | Render (backend + PostgreSQL), Vercel (admin + worker web app) |
| i18n | LocalizationContext + locales/en.json, hi.json, te.json |

---

## ✅ What's Real vs Simulated

| Component | Status | Detail |
|-----------|--------|--------|
| Weather data | ✅ Live | OpenWeatherMap API — real current readings |
| AQI data | ✅ Live | OpenAQ API — real PM2.5 values |
| Location search | ✅ Real | Nominatim — works anywhere in India |
| GPS detection | ✅ Real | Device GPS + reverse geocode + zone mapping |
| OTP system | ✅ Real (demo-safe) | Random 6-digit OTP, animated auto-fill |
| Fraud engine | ✅ Fully coded | All 4 layers execute on every claim |
| ML premium | ✅ Real model | XGBoost trained on risk features |
| WebSockets | ✅ Real | Live bidirectional push updates |
| Earnings DNA | ✅ Real | Computed from claim history + zone baselines |
| Forecast Shield | ✅ Real | 48-hour forecast from OpenWeatherMap |
| Multilingual | ✅ Real | Built-in EN / HI / TE — no translation API |
| Payouts | ✅ Real logic | DNA formula + Razorpay test-mode records |
| Priority scoring | ✅ Real | Support ticket urgency scoring in DB |
| DBSCAN anomaly | ✅ Real | Zero-day mass offline detector |
| Payment collection | 🔶 Test mode | Razorpay Checkout in test — no real money |

---

## 📱 Worker App — Access Options

**Browser (no install):** [https://safenet-sage.vercel.app](https://safenet-sage.vercel.app) — works on any phone or desktop

**Expo Go (native):** Install Expo Go → scan QR on the entry page or open:
```
exp://u.expo.dev/2d45889e-9415-4966-be7f-ba2711a57f13/group/278ac272-c5ef-40dc-beb2-25d1c58cae8e
```

**Local run:**
```bash
git clone https://github.com/BHARGAVSAI558/devtrails-2026-alphanexus-phase2
cd devtrails-2026-alphanexus-phase2/SafeNetFresh
npm install && npm start
```

---

## 📁 Project Structure

```
alpha/                               ← Repository root
│
├── SafeNetFresh/                    ← Expo app (mobile + web)
│   ├── screens/
│   │   ├── OnboardingScreen.js      ← Phone entry + OTP send
│   │   ├── OTPVerifyScreen.js       ← Animated OTP auto-fill + verify
│   │   ├── ProfileSetupScreen.js    ← 5-step onboarding wizard
│   │   ├── DashboardScreen.js       ← Live weather, AQI, DNA heatmap
│   │   ├── PolicyScreen.js          ← Coverage tiers + payment gateway
│   │   ├── ClaimsScreen.js          ← Claim history + live pipeline
│   │   ├── ProfileScreen.js         ← Bank/UPI details, account settings
│   │   └── NotificationsScreen.js   ← Push notification history
│   ├── components/
│   │   ├── WebSocketBridge.js       ← WS connection lifecycle
│   │   ├── AssistantModal.js        ← Multilingual support chat
│   │   ├── DisruptionModal.js       ← Live disruption alert overlay
│   │   └── LocationGate.js          ← GPS permission + zone detection
│   ├── contexts/
│   │   ├── AuthContext.js           ← JWT + profile state
│   │   ├── ClaimContext.js          ← Live claim updates
│   │   ├── PolicyContext.js         ← Coverage state
│   │   └── LocalizationContext.js   ← EN/HI/TE i18n
│   ├── services/
│   │   ├── api.js                   ← Axios client, all API calls
│   │   └── websocket.service.js     ← WS connection + reconnect
│   ├── locales/                     ← en.json, hi.json, te.json
│   └── hooks/
│       ├── useWorkerProfile.js      ← Profile + trust score
│       ├── useGPSZoneDetection.js   ← GPS → zone mapping
│       └── usePayoutHistory.js      ← Payout records
│
└── safenet_v2/
    ├── backend/                     ← FastAPI (deployed on Render)
    │   └── app/
    │       ├── api/v1/routes/
    │       │   ├── admin.py         ← All admin endpoints + claims/live
    │       │   ├── auth.py          ← OTP send/verify, JWT issue
    │       │   ├── claims.py        ← Claim history, payouts, receipts
    │       │   ├── policies.py      ← Coverage CRUD + Razorpay orders
    │       │   ├── workers.py       ← Profile, dashboard, DNA
    │       │   ├── zones.py         ← Zone data, forecast, risk mode
    │       │   └── websockets.py    ← WS endpoints for worker + admin
    │       ├── engines/
    │       │   ├── fraud/           ← Layer 1–4 fraud pipeline
    │       │   ├── confidence_engine.py  ← Weather+AQI signal scoring
    │       │   ├── payout_engine.py      ← DNA-based payout calculation
    │       │   ├── premium_engine.py     ← XGBoost premium pricing
    │       │   ├── trust_engine.py       ← Per-worker trust scoring
    │       │   └── zero_day_detector.py  ← DBSCAN mass offline detection
    │       ├── services/
    │       │   ├── earnings_dna_service.py   ← 7×24 DNA matrix
    │       │   ├── forecast_shield_service.py ← 48h forecast upgrade
    │       │   ├── weather_service.py         ← OpenWeatherMap
    │       │   └── aqi_service.py             ← OpenAQ
    │       ├── models/              ← SQLAlchemy ORM models
    │       ├── tasks/               ← APScheduler background jobs
    │       └── ml/                  ← XGBoost model + trainer
    │
    └── admin/                       ← React dashboard (deployed on Vercel)
        └── src/
            ├── pages/
            │   ├── Login.tsx        ← Unified entry (worker QR + admin)
            │   ├── AdminLogin.tsx   ← Enterprise admin login
            │   ├── Dashboard.tsx    ← Live KPIs + claim feed
            │   ├── Claims.tsx       ← Claims feed (WS + DB)
            │   ├── Workers.tsx      ← Worker registry + profiles
            │   ├── FraudInsights.tsx ← Fraud analytics
            │   ├── ZoneHeatmap.tsx  ← Leaflet zone map
            │   └── SupportQueries.tsx ← Ticket management
            ├── stores/              ← Zustand: auth, claims, fraud, pool
            └── services/
                └── admin_websocket.ts ← Admin WS multiplexed feed
```

---

## 🚀 Local Development

### Backend
```bash
cd safenet_v2/backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
# Health: http://127.0.0.1:8000/health
```

### Admin Dashboard
```bash
cd safenet_v2/admin
npm install && npm run dev
# http://localhost:5173 — login: admin / admin123
```

### Worker App
```bash
cd SafeNetFresh
npm install
npm start                  # Expo Go via QR (LAN)
npm run start:tunnel       # Phone on cellular / different network
npx expo start --web       # Browser at http://localhost:8081
```

### Environment Variables (backend)
```env
JWT_SECRET=your-secret
ADMIN_JWT_SECRET=your-admin-secret
OPENWEATHER_API_KEY=your-key
DEMO_MODE=false
ALLOWED_ORIGINS=*
DATABASE_URL=postgresql+asyncpg://user:pass@host/dbname
```

---

## ⚙️ Production Reliability

### Cold Start Handling
The backend runs on Render free tier and may sleep after inactivity. Both apps handle this gracefully:
- A background warmup ping fires immediately when the login/onboarding screen opens (`/health` endpoint, 15 s timeout)
- If the first request times out, the UI shows **"Server is starting, please wait a few seconds."** — never a raw error
- The admin login shows **"Reconnecting..."** for 3 s then settles to the waking message
- Worker app onboarding shows **"⏳ Starting server… please wait 10 seconds."**

### Timeout Configuration
| Layer | Main requests | Warmup ping |
|-------|--------------|-------------|
| Admin (`api.ts`) | 30 s | 15 s |
| Worker (`api.js`) | 30 s | 15 s |

### Retry Logic
Both apps retry **once** (2 s delay) on transient failures only:

| Condition | Retried |
|-----------|--------|
| `ECONNABORTED` (timeout) | ✅ |
| `ERR_NETWORK` (unreachable) | ✅ |
| 502 / 503 / 504 (gateway) | ✅ |
| 400 / 401 / 403 / 404 / 422 | ❌ never |

### User-Facing Error Messages
| Situation | Message shown |
|-----------|---------------|
| Timeout / cold start | "Server is starting, please wait a few seconds." |
| Retrying | "Reconnecting..." |
| Network unreachable | "Unable to reach server right now. Check your connection." |
| Gateway error (502–504) | "Unable to reach server right now. Please try again in a moment." |
| Bad credentials | "Invalid username or password." |

### WebSocket Live Updates
- Worker WebSocket connects only after the dashboard is fully loaded (inside `ProtectedMainTabs`) — no startup overhead
- Admin WebSocket multiplexes claim updates, fraud alerts, zone events, and pool health on a single connection
- Both clients reconnect automatically with exponential back-off (max 30 s) on disconnect
- Admin Claims page merges live WS events at the top of the DB-fetched list with a green live indicator dot

---

## Submission Quick Links

### Pitch Deck
[Add public pitch deck link here](https://docs.google.com/presentation/d/1LhPPk7UFxfjY6dbjz6kf0PqrQdqvn945/edit?usp=sharing&ouid=116368085396987359147&rtpof=true&sd=true)



### Live Links
Worker App: [https://safenet-sage.vercel.app](https://safenet-sage.vercel.app)  
Admin Dashboard: [https://safenet-admin-wine.vercel.app](https://safenet-admin-wine.vercel.app)  
Backend API: [https://safenet-api-y4se.onrender.com](https://safenet-api-y4se.onrender.com)

---

*DevTrails 2026 — Team AlphaNexus*
