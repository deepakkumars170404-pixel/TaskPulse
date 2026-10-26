# TaskToggle

Intelligent Daily Task Distribution & Timing Platform.

🌐 **Live Production Link:** [https://tasktoggle.vercel.app](https://tasktoggle.vercel.app)

---

## Overview
A brand-agnostic, white-label ready organizational productivity system designed for daily task assignments, peer delegation, and office timing controls. Optimized for both **PC (desktop / laptop)** and **Mobile (smartphones & tablets)**.

---

## Key Features

### 🖥️ PC & Mobile Web Experience
- **Responsive Layout:** Adaptive sidebar for desktop and slide-over navigation drawer for mobile.
- **Mobile Bottom Navigation Bar:** Dedicated bottom tab bar for quick thumb access to all role-based views.
- **Horizontal Swipeable Chips:** Filter timelines, priorities, and status tags with smooth swipe actions.
- **Multi-Device Parity:** Full access to all admin tools, staff to-do lists, and issue reporting across screens.

### ⚡ Backend & Cloud Database
- **Vercel Serverless API:** Built-in REST endpoints (`/api/tasks`, `/api/timing`, `/api/health`).
- **Supabase Real-time Cloud Sync:** Instant bi-directional synchronization across connected devices.
- **Resilient Fallback:** Seamless local storage persistence when running offline.

---

## Backend API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Backend health & database status |
| `/api/tasks` | `GET` | Fetch all organizational tasks |
| `/api/tasks` | `POST` | Create and dispatch new task |
| `/api/tasks?id={id}` | `PATCH` | Update task status or pending reason |
| `/api/timing` | `GET`, `POST` | Manage office hours and event timings |

---

## Database Setup

1. Copy the SQL script from [`supabase_schema.sql`](./supabase_schema.sql).
2. Run it in your Supabase project's **SQL Editor**.
3. Add the following to your Vercel Project Environment Variables:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-or-publishable-key
   ```
