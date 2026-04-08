# 🛡️ SafeNet — AI Income Protection for Gig Workers

> **Guidewire DevTrails 2026 — Phase 2** | Team AlphaNexus
>
> *"SafeNet doesn't ask you to prove anything. It proves it for you."*

---

## 🚀 Try It Now

| | URL |
|--|--|
| 📱 **Worker App (Web)** | **[https://safenet-sage.vercel.app](https://safenet-sage.vercel.app)** |
| 🖥️ **Admin Dashboard** | **[https://safenet-admin-wine.vercel.app/admin-login](https://safenet-admin-wine.vercel.app/admin-login)** |
| ⚙️ **Backend API** | [https://safenet-api-y4se.onrender.com](https://safenet-api-y4se.onrender.com) |
| ❤️ **Health Check** | [https://safenet-api-y4se.onrender.com/health](https://safenet-api-y4se.onrender.com/health) |
| 🎬 **Demo Video** | [Watch on YouTube](https://youtube.com/shorts/KdsrN05xIyM) |
| 💻 **GitHub** | [devtrails-2026-alphanexus-phase2](https://github.com/BHARGAVSAI558/devtrails-2026-alphanexus-phase2) |

---

## ⚡ Start Here — 2-Minute Demo Flow

### As a worker (open on your phone):

1. Go to **[https://safenet-sage.vercel.app](https://safenet-sage.vercel.app)**
2. Enter any 10-digit mobile number → OTP appears on screen → enter it
3. Select platform (Zomato/Swiggy) → pick your zone → set working hours → choose coverage tier
4. Dashboard loads with **live weather**, **real AQI**, **Forecast Shield**, and **Earnings DNA**
5. Tap **"Simulate disruption"** → pick Heavy Rain → watch the full pipeline run live

### As an admin (open on your laptop at the same time):

1. Go to **[https://safenet-admin-wine.vercel.app/admin-login](https://safenet-admin-wine.vercel.app/admin-login)**
2. Username: `admin` · Password: `admin123`
3. Watch the same claim appear in the live dashboard feed in real time

---

## 📱 Worker App — All Ways to Access

### Browser (no install needed)
**[https://safenet-sage.vercel.app](https://safenet-sage.vercel.app)** — works on any phone or desktop browser

### Expo Go (native mobile experience)
Install **Expo Go** from App Store or Play Store, then scan:

![SafeNet QR Code](safenet_v2/admin/public/worker-app-qr.png)

Or open this link directly in Expo Go:
```
exp://u.expo.dev/2d45889e-9415-4966-be7f-ba2711a57f13/group/598be6e8-b9b4-4239-8124-7b5ff779a7be
```

### Run locally
```bash
git clone https://github.com/BHARGAVSAI558/devtrails-2026-alphanexus-phase2
cd devtrails-2026-alphanexus-phase2/SafeNetFresh
npm install && npm start
```

---

## 💡 The Problem

India's food delivery partners earn per day, not per month. When disruptions hit, they lose income with no fallback:

| Disruption | What happens |
|-----------|-------------|
| Heavy rain | Roads unsafe, orders cancelled |
| Extreme heat >42°C | Health risk, forced offline |
| AQI >300 | Hazardous to work outdoors |
| Curfews / strikes | Zone locked down |
| Platform outages | No orders despite being available |

No existing insurance covers this. Traditional insurance excludes income loss. Government schemes exclude informal workers. Every system either requires proof the worker cannot provide or pays a flat amount unrelated to their actual loss.

---

## 🎯 What SafeNet Does Differently

```
Every other system:   disruption happens → pay fixed amount
SafeNet:              learn worker's earning reality → pay what they actually lost
```

### Core Insight

Ravi works Thursday evenings and earns ₹87/hour at that time. When flooding hits at 8 PM Thursday, the right payout is ₹87 × disruption hours — not a flat ₹500.

This requires knowing Ravi's personal earning pattern. SafeNet builds that automatically.

---

## 🧬 Earnings DNA — The Core Innovation

Every worker gets a personal earning fingerprint — a 7×24 matrix showing what they typically earn each hour of each day.

```
           6A  8A  10A  12P  2P  4P  6P  8P  10P
Monday   [ ░   ▒   ▒   ▓   ▓   ▒   ▒   ▓   ▒  ]
Tuesday  [ ░   ▒   ▒   ▓   ▓   ▒   ▓   █   ▒  ]
Wednesday[ ░   ▒   ▒   ▓   ▒   ▒   ▒   ▓   ▒  ]
Thursday [ ░   ▒   ▒   ▓   ▓   ▒   ▓   █   ▓  ] ← Peak 7-10 PM
Friday   [ ░   ▒   ▒   ▓   ▓   ▒   ▓   █   ▒  ]
Saturday [ ░   ▒   ▓   █   ▓   ▒   ▓   █   ▒  ]
Sunday   [ ░   ▒   ▓   █   █   ▒   ▒   ▓   ░  ] ← Peak 12-2 PM

░ low   ▒ medium   ▓ high   █ peak
```

**What the worker sees on dashboard:**
- Live earning status (High/Moderate/Low demand window)
- ₹120–₹150/hr expected in your zone right now
- Next peak: Thursday 12 AM–3 AM
- Weekly progress: ₹649 / ₹8929 expected

**Why this matters:** Payout = earning fingerprint value × disruption hours, capped at tier maximum. Not a flat amount. The worker's actual loss.

---

## 🛡️ Forecast Shield

SafeNet checks weather forecasts every 6 hours. When risk is predicted:

```
Tonight (before disruption):
  System detects: heavy rain predicted tomorrow 3 PM – 7 PM (82% confidence)
  Action: coverage auto-upgraded to Pro · ₹700/day for 4 hours
  Worker notified: "Forecast Shield Active — no extra cost"

Tomorrow during disruption:
  Payout calculated at upgraded tier automatically
  Message: "SafeNet predicted this risk 18 hours ago and upgraded your coverage"
```

This is the opposite of how insurance normally works — protection upgrades itself before you need it.

---

## 🔄 Zero-Touch Claim Pipeline

```
                    ┌─────────────────────────────┐
                    │   Background Scheduler       │
                    │   Runs every 30 min          │
                    │   6 AM – 11 PM IST           │
                    └──────────────┬──────────────┘
                                   │ Polls all zones
                                   ▼
                    ┌─────────────────────────────┐
                    │   Confidence Engine          │
                    │   Weather + AQI + Alerts     │
                    │   → HIGH / MIXED / LOW       │
                    └──────────────┬──────────────┘
                                   │ HIGH
                                   ▼
                    ┌─────────────────────────────┐
                    │   Behavioral Engine          │
                    │   GPS trail vs baseline      │
                    │   → deviation score 0-100    │
                    └──────────────┬──────────────┘
                                   │ deviation > threshold
                                   ▼
                    ┌─────────────────────────────┐
                    │   Fraud Pipeline (4 layers)  │
                    │   L4 → L1 → L2 → L3         │
                    │   → CLEAN / FLAGGED / BLOCK  │
                    └──────────────┬──────────────┘
                                   │ CLEAN
                                   ▼
                    ┌─────────────────────────────┐
                    │   Decision Engine            │
                    │   All scores + trust score   │
                    │   → APPROVE / REJECT         │
                    └──────────────┬──────────────┘
                                   │ APPROVE
                                   ▼
                    ┌─────────────────────────────┐
                    │   Payout Engine              │
                    │   DNA-based calculation      │
                    │   → ₹ credited + notified    │
                    └─────────────────────────────┘
                                   │
                    WebSocket push to worker app + admin
```

Worker sees on their phone:

```
Disruption Detected  ●  →  Verifying Signals  ●  →  Fraud Check  ●  →  Decision  ●
```

Each step updates in real time via WebSocket. No action required from the worker at any point.

---

## 🕵️ 4-Layer Fraud Engine

Stops coordinated spoofing rings before any payout goes through.

```
LAYER 4 — Enrollment Timing Anomaly
  Did multiple workers sign up right before a predicted storm?
  Mass enrollment detected → elevated scrutiny applied
              ↓
LAYER 1 — GPS Signal Integrity
  Teleportation check: jumped 3km in 20 seconds?
  Static spoof: GPS variance exactly zero (machine-perfect)?
  Cell tower mismatch: GPS says Zone A, tower says Zone C?
              ↓
LAYER 2 — Cross-Signal Corroboration
  S1: Is worker GPS inside the disrupted zone?
  S2: Do weather/AQI APIs confirm active disruption?
  S3: Is app activity low/absent (not actively working)?
  S4: Did platform order volume drop in this zone?
  4/4 agree → APPROVE · 3/4 → APPROVE · 2/4 → FLAG · 1/4 → BLOCK
              ↓
LAYER 3 — Fraud Ring Detection
  Zone density spike: 8+ flagged claims in 1 hour?
  Timestamp sync: 5+ workers submitted within 3 minutes?
  Pattern homogeneity: identical inactivity durations?
  → CONFIRMED ring → freeze all cluster payouts → admin alert
```

**Honest-worker-first principle:** 3 of 4 signals still approves. A weather API delay should never punish a genuine worker. SafeNet delays before it denies.

---

## 💬 Support Assistant — Multilingual

Floating assistant accessible from every screen:

- **Predefined queries**: Why didn't I get paid? What is my claim status? Is there a disruption now?
- **Raise Ticket**: unique ticket ID (TKT-000001), tracked in admin queue
- **Language switch**: English / हिंदी / తెలుగు — no external translation API, all built-in
- **Admin reply loop**: admin responds from dashboard → reply pushed back to user's chat → notification triggered

---

## 🖥️ Admin Dashboard Features

| Page | What it shows |
|------|--------------|
| Dashboard | KPIs: active workers, claims today, fraud blocked, pool utilization, pooled vs paid weekly |
| Zone Heatmap | Hyderabad map with zones colored by disruption density (green/orange/red) |
| Fraud Insights | Fraud queue with cluster confidence levels, fraud score distribution chart, enrollment vs weather signal timeline |
| Workers | Searchable registry with trust score, tier, premium, claims count, fraud flags — click any worker for full profile + claim history |
| Simulations | Run any disruption scenario from admin, inspect outcomes |
| Support | All user queries and tickets with admin reply interface, resolve/open status, multilingual messages |

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
           │   safenet-api-y4se           │
           │   .onrender.com              │
           │                              │
           │  /api/v1/auth  /api/v1/zones │
           │  /api/v1/workers  /api/v1/   │
           │  policies  /api/v1/claims    │
           │  /ws/claims  /ws/admin       │
           └──┬────────────┬─────────────┘
              │            │
        ┌─────▼──┐   ┌─────▼──────────────────┐
        │Postgres│   │ External APIs           │
        │        │   │ OpenWeatherMap (live)   │
        │Workers │   │ OpenAQ (live AQI)       │
        │Policies│   │ Razorpay (test mode)    │
        │Claims  │   │ APScheduler (30min jobs)│
        └────────┘   └────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Worker App | React Native, Expo, Expo Web |
| Admin | React, Vite, TypeScript, Tailwind CSS, Recharts, Leaflet |
| Backend | FastAPI, Python, SQLAlchemy, Alembic, PostgreSQL |
| ML | XGBoost, scikit-learn (dynamic premium model) |
| Real-time | WebSockets, Redis pub/sub |
| External APIs | OpenWeatherMap (weather), OpenAQ (AQI), Razorpay test |
| Background Jobs | APScheduler (polls zones every 30 min, 6 AM–11 PM IST) |
| Deployment | Render (backend + DB), Vercel (admin + worker web app) |

---

## ✅ What's Real vs Simulated

| Component | Status | Detail |
|-----------|--------|--------|
| Weather data | ✅ Live | OpenWeatherMap API — real readings |
| AQI data | ✅ Live | OpenAQ API — real PM2.5 values |
| OTP system | ✅ Real | Random 6-digit OTP, shown on screen (demo mode) |
| Fraud engine | ✅ Fully coded | All 4 layers running on every claim |
| ML premium | ✅ Real model | XGBoost trained, runs on activation |
| WebSockets | ✅ Real | Live bidirectional updates |
| Earnings DNA | ✅ Real | Computed from claim history + city baselines |
| Forecast Shield | ✅ Real | 48h forecast from OpenWeatherMap |
| Payouts | 🔶 Simulated | Razorpay test mode — no real money |
| GPS tracking | 🔶 Simulated | Pre-scripted trails for demo |

---

## 📁 Project Structure

```
devtrails-2026-alphanexus-phase2/
│
├── SafeNetFresh/                    ← Expo app (mobile + web)
│   ├── screens/                     ← Onboarding, Dashboard, Claims,
│   │                                   Coverage, Account
│   ├── components/                  ← WebPhoneFrame, AppModal,
│   │                                   DisruptionModal, WebSocketBridge
│   ├── contexts/                    ← Auth, Claims, Policy state
│   ├── services/                    ← api.js, websocket, location,
│   │                                   notifications, fingerprint
│   └── hooks/                       ← TanStack Query data hooks
│
└── safenet_v2/
    ├── backend/                     ← FastAPI (Render)
    │   └── app/
    │       ├── engines/             ← confidence, fraud (L1-L4),
    │       │                           premium, payout, behavioral
    │       ├── services/            ← weather, AQI, OTP, realtime,
    │       │                           notifications
    │       ├── models/              ← PostgreSQL schemas
    │       ├── tasks/               ← APScheduler background jobs
    │       └── ml/                  ← XGBoost premium model
    │
    └── admin/                       ← React dashboard (Vercel)
        └── src/
            ├── pages/               ← Dashboard, Zones, Fraud,
            │                           Workers, Simulations, Support
            ├── stores/              ← Zustand real-time state slices
            └── services/            ← WebSocket admin feed
```

---

## 🚀 Local Development

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
# Opens at http://localhost:5173
# Login: admin / admin123
```

### Worker App (mobile)
```bash
cd SafeNetFresh
npm install
npm start              # Expo Go via QR
npx expo start --web   # Browser at http://localhost:8081
```

### Environment Variables (backend)
```
JWT_SECRET=your-secret
ADMIN_JWT_SECRET=your-admin-secret
OPENWEATHER_API_KEY=your-key
DEMO_MODE=true
ALLOWED_ORIGINS=*
DATABASE_URL=postgresql+asyncpg://...  (or leave blank for SQLite)
```

---

*DevTrails 2026 — Team AlphaNexus*
