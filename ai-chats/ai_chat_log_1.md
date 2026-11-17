# OrderMate AI Chat Logs & Development Records

This folder contains the engineering prompts, architectural decisions, and chat records used during the development of OrderMate.

## Log 1: Architectural Definition & Requirements Alignment
- **Date:** 17 November 2026
- **Focus:** System Architecture, Hostel Group Ordering Protocol, Savings Verification Engine, and OrderMate Analyzer.
- **Key Decisions:**
  - Strict MERN stack (MongoDB + Express + React + Node.js) with Socket.IO for real-time order coordination.
  - Separate Boys and Girls hostel registry with zero cross-contamination.
  - Mathematical definition of verified savings: `Individual Checkout Charges Avoided - Individual Share of Combined Charges`.
  - Dual-source Analyzer: Live OrderMate MongoDB Aggregations + Assignment Fieldwork CSV parser (`data.csv`).
