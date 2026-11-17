# OrderMate – In-Depth Research & Problem Analysis

## 1. Target Person & Campus Geography Context
- **Institution:** National Institute of Technology Jamshedpur (NIT JSR), Adityapur, Jharkhand.
- **Geographic Context:** NIT Jamshedpur is located in the Adityapur industrial area, roughly 3.5 km away from the main commercial center of Bistupur. Local food stalls, small general stores, and canteens in and around Adityapur shut down by 9:30–10:00 PM, and on-campus kiosks carry very limited grocery inventory. Consequently, late at night and past midnight, students rely almost exclusively on quick-commerce platforms—principally **Blinkit**, **Flipkart Minutes**, and **Swiggy Instamart**—for daily food essentials and late-night study supplies.
- **Hostel Cluster & Delivery Gate Architecture:** The senior mega hostel complex comprises **Hostel I, Hostel J, Hostel K, and Hostel L**, housing over 2,500 senior B.Tech, MCA, and M.Tech students. Each individual hostel has a designated security gate where delivery riders arrive. Students across different blocks (e.g., Blocks A–E in Hostel K) walk down to their hostel's main gate to collect their parcels. Because Hostels I, J, K, and L are situated adjacent to one another in the residential belt, walking between adjacent hostel gates takes only 2–3 minutes, making cross-hostel coordination highly viable.
- **Target Person:** Aman Singh
- **Academic Standing:** 3rd Year MCA Student
- **Residence:** Hostel K, Block E, Room E601
- **Real-World Persona Workflow:** Aman studies late into the night working on placement coding rounds, software projects, and semester coursework. Between 11:00 PM and 1:30 AM, he frequently needs simple essentials—specifically a small sachet/pouch of instant coffee and milk to prepare coffee for late-night study sessions.
- **The Core Friction (The Cart-Stuffing Trap):**
  - Aman only needed **1x small coffee (₹35–₹45)** and **1x Amul Toned Milk 500ml (₹28)**, amounting to a base cart of **₹63–₹73**.
  - On checkout, quick-commerce platforms slapped on:
    - Delivery Fee: ₹25
    - Small Cart Penalty: ₹20
    - Handling Fee: ₹5
    - Night Surge: ₹15
    - **Total Extra Fees: ₹65** (an 89% penalty on a ₹73 order).
  - To dodge paying ₹65 in pure fees, Aman was forced to add a **larger coffee jar (Nescafe Classic 100g)** and **extra milk sachets/flavoured milk**, spending an extra **₹150+** that he did not plan to spend that night, simply to cross the ₹199 free-delivery threshold.
  - While he avoided the ₹65 fee on paper, his actual out-of-pocket cash loss was over ₹150 for inventory he did not need immediately.

---

## 2. The Problem Statement (5 Lines)
1. Senior hostel students at NIT Jamshedpur (Hostels I, J, K, L) rely heavily on quick-commerce apps (Blinkit, Flipkart Minutes, Swiggy Instamart) for daily essentials after campus food outlets close at 10 PM.
2. For small essential orders (₹40–₹90), platforms levy multiple checkout surcharges (delivery, small-cart penalty, handling, night surge), raising checkout prices by 60% to over 100%.
3. To bypass these fees, students fall into the "threshold inflation trap," buying ₹130–₹200 of extra unwanted items (larger coffee packs, surplus milk, impulse snacks) solely to hit the free-delivery tier.
4. Multiple students within the same hostel blocks (Blocks A–E in Hostel K) or neighboring hostels (J & L) routinely place fragmented, solo orders to the same delivery gate within the same 15-to-20-minute window without knowing of each other's purchases.
5. Students lack a dedicated, hyper-local coordination tool to discover nearby shopping invitations in real time, pool their carts to satisfy platform thresholds together, and eliminate avoidable losses.

---

## 3. Quantitative Economic Analysis: The Micro-Cart Penalty

To quantify why this problem severely impacts a student's monthly budget, consider the breakdown of a typical late-night purchase for someone like Aman Singh:

| Item Needed | Base Cost | Applied Platform Charges (Sub-₹149 Order) | Total Checkout Cost | Effective Markup % |
| :--- | :--- | :--- | :--- | :--- |
| 1x Amul Toned Milk (500ml) | ₹28 | Delivery: ₹25 + Small Cart Fee: ₹20 + Handling: ₹5 + Night Surge: ₹15 | ₹93 | **+232%** |
| 1x Coffee + 1x Milk (500ml) | ₹73 | Delivery: ₹25 + Small Cart Fee: ₹20 + Handling: ₹5 + Night Surge: ₹15 | ₹138 | **+89.0%** |
| 6x Farm Fresh Eggs + Bread | ₹85 | Delivery: ₹25 + Small Cart Fee: ₹15 + Handling: ₹6 | ₹131 | **+54.1%** |

### The Two Harmful Coping Strategies
1. **Strategy 1: Paying the Solo Surcharge:** Paying ₹50–₹70 in artificial checkout surcharges on a ₹70 order is economically unsustainable for students living on a monthly budget. Over 15–20 late-night orders in a semester, a student loses ₹800–₹1,400 purely to delivery friction.
2. **Strategy 2: The "Phantom Saving" Trap (Cart Stuffing):** Rather than paying ₹65 in fees, students like Aman buy an oversized coffee jar or surplus milk sachets worth ₹150–₹200. Although they "saved" ₹65 in platform charges, their net cash outflow increased by ₹150+ on items they did not need immediately, accelerating financial drain and unnecessary consumption.

---

## 4. Evaluation of Existing Solutions & Why They Fail

### Solution 1: Hostel Wing & Batch WhatsApp / Telegram Groups
Students occasionally post in wing or batch WhatsApp groups (*"Anyone ordering from Blinkit to Hostel K?"*). However, this method breaks down because:
- **High Noise-to-Signal Ratio:** Group messages are rapidly buried under academic announcements, project discussions, memes, and wing banter.
- **Siloed Network Boundaries:** WhatsApp groups are fragmented by academic branch or specific floor wings. A student in Hostel K Block E cannot see orders posted by an MCA peer in Hostel J or an M.Tech student in Hostel L, even though the delivery rider arrives at adjacent gates 100 meters apart.
- **Zero Expiry or Urgency State:** WhatsApp messages lack built-in expiration timers. A student replying 20 minutes later finds the order was already finalized and placed.
- **Manual Accounting Chaos:** Tracking individual product variants, prices, and collecting UPI payments inside an unformatted chat thread creates friction for the student placing the order.

### Solution 2: Individual Solo Ordering by Absorbing Delivery Fees or Cart Stuffing
Accepting platform fees as an isolated buyer fails because:
- **Ignores Hyper-Local Density:** Hostels I, J, K, and L are situated adjacent to each other with high student density. The physical cost of meeting at the hostel gate to pick up a combined order is near zero (2 minutes walk).
- **Sub-Optimal Unit Economics:** Dark stores enforce basket minimums (₹199–₹299) to cover rider pickup and drop costs. By pooling 2 or 3 micro-orders, students instantly hit dark-store free delivery thresholds without spending an extra rupee on unwanted items.

---

## 5. Analytical Source Study (3 Notes for Each Source)

### Source 1: Blinkit – Pricing, Charges & Terms of Service
- **Link:** https://blinkit.com/terms?mobile=1
- **Note 1:** Blinkit's terms officially differentiate base delivery fees from variable service charges, including convenience fees, handling charges, and small-cart penalties.
- **Note 2:** The terms confirm that small-cart charges are deliberately levied on low basket values (typically sub-₹99 or sub-₹149) to discourage unprofitable single-item dispatches.
- **Note 3:** Because handling and small-cart fees drop to ₹0 once cart value crosses the platform's basket threshold (typically ₹199 or ₹249), combining two students' carts (e.g., ₹73 + ₹130 = ₹203) completely wipes out the delivery and small-cart surcharge.

### Source 2: Flipkart Minutes – Quick-Commerce Dark Store Unit Economics
- **Link:** https://www.flipkart.com/pages/terms
- **Note 1:** Flipkart Minutes relies on automated micro-fulfillment centers (dark stores) targeting 10–15 minute delivery turnarounds. The unit economics require an Average Order Value (AOV) of at least ₹200–₹250 to achieve positive contribution margins.
- **Note 2:** When order totals fall below this threshold, the platform shifts logistical costs to the consumer via a mandatory delivery fee (₹20 to ₹35) plus convenience charges.
- **Note 3:** This structural economic design proves that quick-commerce platforms will never offer free delivery on individual ₹50 orders. Therefore, client-side coordination among nearby students via OrderMate is the only sustainable way for students to access micro-orders without fee penalties.

### Source 3: WhatsApp Help Center – About Disappearing Messages & Architecture
- **Link:** https://faq.whatsapp.com/673193694148537/
- **Note 1:** WhatsApp ephemeral messaging is limited to blanket chat settings (24 hours, 7 days, 90 days), with zero support for granular order-level deadlines (e.g., 20-minute countdowns).
- **Note 2:** Chat interfaces lack structured data models: they cannot validate item quantities, prevent duplicate claims, or dynamically calculate running cart totals.
- **Note 3:** This confirms why a WhatsApp chat does not provide the custom 50-minute visibility period planned for an OrderMate order invitation, necessitating a dedicated state-driven platform (`ACTIVE` → `PLACED` → `COMPLETED` / `EXPIRED`).

---

## 6. The Proposed Solution: OrderMate
**OrderMate** (*"Better orders. Shared savings."*) is a location-aware, time-limited group ordering application designed specifically for college hostel clusters.

- **Hostel-Priority Discovery:** When a student like Aman Singh needs coffee and milk, he can either browse open orders from Hostel K or publish an invitation for Blinkit / Flipkart Minutes with a custom 20-to-50-minute expiration window.
- **Threshold Matching:** Displays the exact cart amount still required (e.g., *“Needs ₹115 more for free delivery”*). Nearby students in Hostel K or Hostels J/L can submit join requests with their specific items and expected contribution.
- **Dedicated Real-Time Chatroom:** Once accepted, participants access an authenticated Socket.IO chatroom to confirm item variants and arrange handover at the hostel gate.
- **Verified Mathematical Savings:**
  $$\text{Individual Confirmed Savings} = \text{Individual Solo Charges Avoided} - \text{Individual Fair Share of Combined Charges}$$
  OrderMate eliminates both the ₹65 solo delivery fee and the ₹150+ in forced, unneeded cart stuffing, keeping student finances sound.
