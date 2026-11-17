# OrderMate

> **Better orders. Shared savings.**  
> *A location-aware, time-limited group ordering and impact analytics platform designed for college hostel students.*

---

## 🚀 3-Minute Video Demonstration
[![OrderMate Demo Video](https://img.shields.io/badge/Demo_Video-Watch_Screen_Recording-emerald?style=for-the-badge&logo=youtube)](https://drive.google.com/file/d/1bUuIRq8GncERcv9v0SbFt_41-csE159y/view?usp=sharing)  
*(Demo link placeholder: `[Link to 3-minute screen recording: https://drive.google.com/file/d/1bUuIRq8GncERcv9v0SbFt_41-csE159y/view?usp=sharing`)*

---

## 1. Problem Statement
College students frequently order everyday essentials (milk, bread, curd, eggs, study fuel, medicines) via quick-commerce apps like **Blinkit**, **Zepto**, and **Swiggy Instamart**.

When ordering solo:
1. Small carts (e.g. milk worth ₹35) attract steep delivery fees, small-cart fees, handling charges, and surge fees totaling **₹45 to ₹70**.
2. To evade small-cart fees or hit a platform's free-delivery threshold (e.g. ₹199), students frequently add unneeded snacks and beverages—spending **₹135 to ₹240 extra** on impulse purchases.
3. Students living in the same hostel or adjacent wings frequently order from the exact same platforms at the exact same times, but lack an automated, privacy-preserving discovery mechanism to pool orders.

> **Important Boundary:** OrderMate does **not** directly place or automate checkouts on Blinkit or Zepto. The order creator places the actual order via their preferred platform; OrderMate handles **hostel discovery, join coordination, private chatrooms, order fulfillment, and verified savings tracking**.

---

## 2. Core Features

### 📍 Hostel-First Discovery & Geo-Sorting
- Strict hostel registry:
  - **Boys Hostels:** E, F, G, H, I, J, K, L
  - **Girls Hostels:** A, B, C, D, M
- User's own hostel orders always receive highest display priority.
- Proximity-based sorting for adjacent hostels with optional browser geolocation permissions (exact private coordinates are never exposed).

### ⏱️ Custom Order Visibility Expiration
- Planned ordering time (e.g., *“Ordering in 10 minutes”*) is decoupled from visibility duration (e.g., *50 minutes*).
- Live countdown timers on active orders.
- Backend-enforced expiration removes expired orders from the active feed while permanently preserving order and chat history.

### 🤝 Join Requests & Live Contribution Tracking
- Students submit join requests with items needed and expected spending.
- Live progress bar visualizes contributed amount towards the creator's target threshold (e.g., *₹85 contributed of ₹115 needed*).
- Creator can Accept or Reject requests with instant in-app alerts.

### 💬 Dedicated Real-Time Chatroom
- WebSocket-powered group chat (Socket.IO) authenticated and restricted strictly to the creator and accepted participants.
- Side panel detailing participant spending, platform info, and threshold countdown.
- Persisted in MongoDB and remains accessible after order expiration for delivery and UPI coordination.

### 💰 Verified Savings Tracker
- **No fabricated savings:** The remaining amount needed to reach a cart threshold is *never* counted as a saving.
- Strict formula:
  $$\text{Individual Confirmed Savings} = \text{Individual Solo Charges Avoided} - \text{Individual Fair Share of Combined Charges}$$
- Separately logs impulse spend avoided when students refrain from buying unneeded items.

### 📊 OrderMate Analyzer (The Impact Engine)
Dual-source analytical dashboard:
- **Source A: Live Application Orders:**
  - Unique students helped (with verified positive savings).
  - Repeat student ratio, completion rate, join acceptance rate.
  - Platform-wise and aggregated hostel-wise savings breakdown.
  - Transparent OrderMate Effectiveness Score (0–100).
- **Source B: Assignment Fieldwork Analysis (`data.csv`):**
  - Parses the genuine 22-record fieldwork dataset collected in Hostels J, K, and L.
  - Analyzes the split between students who paid charges vs. students who added unneeded items.
  - Calculates total avoidable loss and projects group-ordering savings.

### 🎯 Personalized Order Recommendations
- Analyzes historical platform frequency, ordering time windows, and typical cart sizes.
- Displays transparent recommendation scores (0–100%) and explanatory badges (*"Matches your most frequent platform"*, *"Same hostel"*).
- Graceful cold-start fallback for new students.

---

## 3. Tech Stack & Architecture

```
                    ┌────────────────────────┐
                    │      React Client      │
                    │  (Vite + Tailwind CSS) │
                    └───────────┬────────────┘
                                │ HTTP / REST & WebSockets (Socket.IO)
                                ▼
                    ┌────────────────────────┐
                    │   Node.js / Express    │
                    │  Backend API & Sockets │
                    └─────┬────────────┬─────┘
                          │            │
            MongoDB Mongoose           CSV Parser
                          │            │
                          ▼            ▼
               ┌────────────────┐  ┌────────────────┐
               │    MongoDB     │  │   data/data.csv│
               │  (Docker Vol)  │  │ (Fieldwork DB) │
               └────────────────┘  └────────────────┘
```

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, Recharts, Socket.IO Client.
- **Backend:** Node.js, Express, Socket.IO, Mongoose, JWT, bcryptjs, csv-parser.
- **Database:** MongoDB 7.0 with persistent volumes.
- **Containerization:** Docker & Docker Compose.

---

## 4. Fieldwork Dataset (`data/data.csv`)

Collected on-site in **Hostel K (Block E and Block F)** during the morning fieldwork session (10:00 AM – 11:30 AM):
- **Total entries:** 25 genuine student orders (including target user Aman Singh, Keshav, Amarnath, Neelkanth, etc.).
- **Strategy Split:**
  - `PAID_CHARGES`: 12 students (paid an average of **₹49.42** in solo delivery, small-cart, handling, and surge fees).
  - `ADDED_UNNECESSARY_ITEMS`: 13 students (spent an average of **₹172.38** extra on surplus items like larger coffee jars and extra milk sachets to cross the ₹199 threshold).
- **Total Avoidable Loss in 1 Night:** **₹2,834** across 25 students.
- **Projected Group Savings:** **₹2,709 net saved** (96% expense reduction) if grouped via OrderMate.

---

## 5. Local Development Setup

### Prerequisites
- Node.js v20+ / v22+
- MongoDB running locally on `mongodb://127.0.0.1:27017/ordermate`

### 1. Clone & Configure
```bash
git clone https://github.com/ashuyadav-24/OrderMate_Insights.git
cd OrderMate
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
npm install
npm test          # Runs unit tests for hostel config, savings formula, and CSV parser
npm start         # Starts backend on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd ../frontend
cp .env.example .env
npm install
npm run dev       # Starts Vite dev server on http://localhost:5173
```

---

## 6. Docker Deployment (Single-Command Run)

Run the entire stack (MongoDB + Backend + Production Frontend + Nginx Reverse Proxy) using Docker Compose:

```bash
docker compose up --build
```

- **Frontend Application:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **MongoDB:** localhost:27017 (persistent volume: `mongo-data`)

To stop:
```bash
docker compose down
```

---

## 7. Assignment Artifacts & Provenance
- `research.md`: Problem statement, existing solution shortcomings (WhatsApp groups vs OrderMate), and referenced sources.
- `fieldwork.md`: Fieldwork observation notes, interview with Ashutosh Yadav (Hostel J), and data methodology.
- `data/data.csv`: 22 genuine, verified student ordering records.
- `reflection.md`: Personal reflection template to be completed without AI assistance.
- `ai-chats/`: AI chat logs and design prompts exported for evaluation.

---

## 8. Limitations
1. **Physical Handover:** Requires participants to meet at the hostel gate or wing lobby to collect their items.
2. **Payment Coordination:** Creators and participants settle item costs directly via UPI; payment gateways are not embedded to prevent platform fees.
3. **Geographic Scope:** Distance algorithms are calibrated for university campus hostel clusters.

---
*Built for the 1-Day Engineering Take-Home Assignment.*
