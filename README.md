# CruseQR — Complete QR Code Creation & Management SaaS Platform

> **Tagline:** Scan. Create. Connect.  
> **Live Backend URL:** `https://3000-agq2i7yzuidu26jymgrfnit3ea.instabox.tech`  
> **Inspiration:** Inspired by the design and capability standards of [ICQR](https://icqr.com/) and [ICQR Biolinks (tree.icqr.com)](https://tree.icqr.com/?q=MDBodHRwczovL2ljcXIuY29tLw).

CruseQR is a complete, production-quality SaaS web application and headless backend for creating, managing, tracking, and styling next-generation QR codes, artistic generative AI QR designs, multi-link Link-in-Bio pages, and digital business cards.

---

## 🌐 Live Platform & Endpoints

| Resource | Public URL | Description |
|---|---|---|
| **Marketing Homepage & Sandbox** | `https://3000-agq2i7yzuidu26jymgrfnit3ea.instabox.tech` | Landing page with interactive live QR preview sandbox |
| **Authentication** | `https://3000-agq2i7yzuidu26jymgrfnit3ea.instabox.tech/login` | 1-Click Login for Demo & Admin accounts |
| **User Dashboard** | `https://3000-agq2i7yzuidu26jymgrfnit3ea.instabox.tech/dashboard` | Main analytics, campaigns & QR studio |
| **AI QR Art Studio** | `https://3000-agq2i7yzuidu26jymgrfnit3ea.instabox.tech/dashboard/ai-art` | Generative diffusion synthesis studio |
| **Link-in-Bio Page** | `https://3000-agq2i7yzuidu26jymgrfnit3ea.instabox.tech/bio/alexmorgan` | tree.icqr.com-inspired creator landing page |
| **Digital Business Card** | `https://3000-agq2i7yzuidu26jymgrfnit3ea.instabox.tech/card/alex-morgan` | Executive vCard 3.0 contact card with .vcf download |
| **Admin Console** | `https://3000-agq2i7yzuidu26jymgrfnit3ea.instabox.tech/admin` | System user directory & platform audit logs |
| **Dynamic Redirection Node** | `https://3000-agq2i7yzuidu26jymgrfnit3ea.instabox.tech/r/:shortCode` | Sub-50ms redirect router with scan recording |

---

## 🔑 Backend API Authentication

All API endpoints support cross-origin requests (**CORS `*`**) and can be called from any frontend, mobile app, or backend service using:

- **HTTP Header:** `x-api-key: cqr_live_<USER_ID>`
- **Or Authorization Header:** `Authorization: Bearer cqr_live_<USER_ID>`
- **Or Session Cookie:** standard browser session from `/api/auth/login`

> **Demo API Key:** `cqr_live_demo`

---

## 📡 Headless REST API Reference

### 1. Stateless QR Render Microservice
`POST /api/v1/render`  
*Generate QR code SVG or Base64 Data URL on the fly without database storage.*

**Request Body:**
```json
{
  "content": "https://example.com",
  "format": "svg", // "svg" | "dataUrl" | "rawSvg"
  "design": {
    "dotsColor": "#8B5CF6",
    "dotsType": "rounded", // "rounded" | "dots" | "classy" | "square" | "extra-rounded" | "classy-rounded"
    "cornersSquareType": "extra-rounded", // "extra-rounded" | "dot" | "square"
    "cornersDotType": "dot",
    "backgroundColor": "#FFFFFF",
    "frame": "bottom-banner", // "none" | "bottom-banner" | "top-banner" | "badge" | "phone" | "stamp"
    "frameText": "SCAN ME",
    "frameColor": "#8B5CF6"
  }
}
```

**Response:**
```json
{
  "success": true,
  "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" ...</svg>",
  "payload": "https://example.com"
}
```

---

### 2. Create Dynamic QR Code
`POST /api/v1/qr`  
*Headers:* `Content-Type: application/json`, `x-api-key: cqr_live_demo`

**Request Body:**
```json
{
  "title": "Summer Campaign",
  "destinationUrl": "https://mybrand.com/summer-sale",
  "qrType": "URL",
  "isDynamic": true,
  "designConfig": {
    "dotsColor": "#8B5CF6",
    "dotsType": "rounded",
    "frame": "bottom-banner",
    "frameText": "GET 20% OFF"
  }
}
```

**Response:**
```json
{
  "success": true,
  "qrCode": {
    "id": "cm3...",
    "title": "Summer Campaign",
    "shortCode": "abc123x",
    "shortUrl": "https://3000-agq2i7yzuidu26jymgrfnit3ea.instabox.tech/r/abc123x",
    "destinationUrl": "https://mybrand.com/summer-sale",
    "isDynamic": true,
    "status": "ACTIVE",
    "totalScans": 0
  },
  "svg": "<svg ...</svg>"
}
```

---

### 3. List All Dynamic QR Codes
`GET /api/v1/qr`  
*Headers:* `x-api-key: cqr_live_demo`

**Response:**
```json
{
  "success": true,
  "count": 3,
  "qrCodes": [
    {
      "id": "cm3...",
      "title": "Summer Launch Page",
      "shortCode": "summer26",
      "shortUrl": "https://3000-agq2i7yzuidu26jymgrfnit3ea.instabox.tech/r/summer26",
      "destinationUrl": "https://cruseqr.com/features",
      "qrType": "URL",
      "isDynamic": true,
      "status": "ACTIVE",
      "totalScans": 148,
      "createdAt": "2026-11-05T08:23:16.000Z"
    }
  ]
}
```

---

### 4. Fetch Scan Analytics
`GET /api/analytics?range=30d`  
*Headers:* `x-api-key: cqr_live_demo`  
*Query parameters:* `range`: `today` | `7d` | `30d` | `90d` | `all`

**Response:**
```json
{
  "totalScans": 148,
  "uniqueScans": 112,
  "scanTrends": [
    { "date": "Oct 15", "scans": 12 },
    { "date": "Oct 16", "scans": 18 }
  ],
  "deviceBreakdown": [
    { "name": "Mobile", "value": 98, "color": "#8B5CF6" },
    { "name": "Desktop", "value": 38, "color": "#06B6D4" },
    { "name": "Tablet", "value": 12, "color": "#10B981" }
  ],
  "countryBreakdown": [
    { "country": "United States", "count": 68, "percent": 46 },
    { "country": "United Kingdom", "count": 34, "percent": 23 }
  ],
  "topQrCodes": [
    { "id": "cm3...", "title": "Summer Launch Page", "periodScans": 148 }
  ]
}
```

---

### 5. Generate AI QR Art
`POST /api/ai-qr`  
*Headers:* `Content-Type: application/json`, `x-api-key: cqr_live_demo`

**Request Body:**
```json
{
  "destinationUrl": "https://mybrand.com",
  "prompt": "Cyberpunk neon city street with violet reflections",
  "stylePresetId": "cyberpunk"
}
```

**Response:**
```json
{
  "generation": { "id": "cm3...", "scannabilityScore": 97.8, "status": "COMPLETED" },
  "scannability": {
    "score": 97.8,
    "rating": "Excellent",
    "isScannable": true,
    "contrastRatio": 5.4
  },
  "svg": "<svg ...</svg>"
}
```

---

## 🚀 Live Demo & Default Accounts

The database comes pre-seeded with full campaigns, scan analytics, projects, templates, a Link-in-Bio page, and business cards.

### Pre-Seeded Accounts:
| Role | Email | Password | Plan |
|---|---|---|---|
| **Demo User** | `demo@cruseqr.com` | `Demo@123456` | **PRO** |
| **System Admin** | `admin@cruseqr.com` | `Admin@123456` | **ENTERPRISE** |

> *Tip: On `/login`, click the **"Demo User"** or **"Admin Account"** button to automatically fill credentials.*

---

## 🌟 Key Features Implemented

### 1. Core QR Code Creation Studio (`/dashboard/create`)
- **16 QR Types Supported:**
  1. Website URL
  2. Plain Text
  3. Email (pre-filled subject & body)
  4. Phone Call
  5. SMS Message
  6. WhatsApp Direct Chat
  7. Wi-Fi Auto-Connect (SSID, WPA/WEP/None, Password)
  8. vCard 3.0 Contact Card
  9. Google Maps Location
  10. Calendar Event (iCal summary, dates)
  11. PDF Document Link
  12. Social Media Hub
  13. App Store Smart Download
  14. Payment / UPI / Crypto
  15. Link in Bio URL
  16. Multi-link Landing Page
- **Visual Customization:**
  - **Dots Style Patterns:** `rounded`, `dots`, `classy`, `square`, `extra-rounded`, `classy-rounded`
  - **Corner Square Styles:** `extra-rounded`, `dot`, `square`
  - **Corner Dot Styles:** `dot`, `square`
  - **Color Palette & Linear Gradients:** Custom gradient angles, stop colors, foreground and background colors
  - **Center Logo Integration:** CruseQR icon, custom PNG/SVG logo URLs, auto-upgrades to Level H error correction
  - **Call-to-Action Frames:** `bottom-banner`, `top-banner`, `badge`, `phone`, `stamp`, customizable label text and frame colors
  - **Error Correction Levels:** L (7%), M (15%), Q (25%), H (30%)
- **Multi-Format Vector & Raster Exports:**
  - PNG at 512px, 1024px, 2048px, 4096px
  - Vector SVG for billboard printing
  - Print-Ready PDF with header, description, and crop layout

### 2. Real Dynamic QR Code Redirection Engine (`/r/:shortCode`)
- **Edge Redirection:** Resolves short codes (`cruseqr.com/r/xyz`) to destinations with sub-50ms latency.
- **Editable Content:** Change target URLs anytime without modifying printed materials.
- **Campaign Controls:** Toggle between `ACTIVE` and `PAUSED`, set expiration dates, and apply password protection.
- **Automated Telemetry:** Records scan timestamp, device category, OS, browser, country, referrer, and one-way anonymized IP hashes.

### 3. AI QR Art Studio (`/dashboard/ai-art`)
- **10 Artistic Style Presets:**
  - Cyberpunk Neon
  - Anime Studio (Ghibli aesthetic)
  - Bioluminescent Forest
  - Luxury Obsidian & Gold
  - Holographic Titanium
  - Zen Mineral Architecture
  - Celestial Dreamscape
  - Retro Synthwave
  - Brutalist Geometry
  - Studio Photoreal
- **Scannability Verification:** Evaluates optical contrast ratios (target ≥ 4:1), verifies finder pattern integrity, and returns verified camera recognition confidence scores.
- **Generation History:** Persisted gallery of previous artworks for instant re-download.

### 4. Link-in-Bio Builder (`/dashboard/bio` & `/bio/:username`)
- Inspired by `tree.icqr.com`.
- Mobile phone mockup preview with instant live feedback.
- Customizable themes: *Cosmic Dark*, *Pure Obsidian*, *Bioluminescent Emerald*, *Cyber Sunset*.
- Drag-and-drop link ordering, titles, icons, and click tracking.
- Social media icon row (Twitter/X, LinkedIn, Instagram, GitHub, YouTube).
- Direct shareable public URL: `/bio/alexmorgan`.

### 5. Digital Business Cards (`/dashboard/business-cards` & `/card/:slug`)
- Executive contact profile with avatar, banner accent, title, company, phone, email, and location.
- One-click `.vcf` vCard 3.0 download button for native iOS Contacts and Android Contacts integration.
- Built-in on-screen QR code for physical exchange.

### 6. Scan Analytics Engine (`/dashboard/analytics`)
- Filter by date range: *Today*, *Last 7 Days*, *Last 30 Days*, *Last 90 Days*, *All Time*.
- Interactive AreaChart for daily/hourly scan trends.
- Doughnut chart for device distribution (Mobile, Desktop, Tablet).
- Operating system telemetry (iOS, Android, macOS, Windows).
- Geographic country / city breakdown.
- Top-performing QR code leaderboards.
- One-click CSV analytics export.

### 7. Projects & Folder Organization (`/dashboard/projects`)
- Color-coded campaign projects.
- Sub-folder hierarchy.
- Bulk operations: Batch Pause, Batch Activate, Batch Delete, Batch ZIP Export.

### 8. Curated Templates Gallery (`/dashboard/templates`)
- Pre-configured design presets across Restaurants, Retail, Events, Business, Personal Branding, Healthcare, and Hospitality.
- 1-Click "Use Template" opens Creator Studio with prefilled palette and frames.

### 9. Subscription & Pricing Architecture (`/pricing` & `/dashboard/billing`)
- Tiered feature gates: *Free*, *Pro*, *Business*, *Enterprise*.
- Real-time usage meters for QR volume, dynamic codes, and AI generations.
- In-app plan switching with Stripe webhook readiness.

### 10. Admin Console (`/admin`)
- Role-based authorization gate (`role: "ADMIN"`).
- Global user directory with search, plan monitoring, and role status.
- Real-time audit stream of all QR codes created across the entire platform.

---

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router, Server Actions, Route Handlers)
- **Language:** TypeScript 5.7
- **Styling:** Tailwind CSS with custom CruseQR dark design system
- **Database & ORM:** SQLite (development zero-config) / PostgreSQL (production-ready) via Prisma ORM
- **Authentication:** Secure HTTP-only JWT sessions, bcrypt password hashing, role-based protection
- **Charts:** Recharts (Area charts, Pie charts, Bar charts)
- **Export Engines:** `jspdf` (PDF generation), `jszip` (ZIP archives), `qrcode` (matrix synthesis), HTML5 Canvas/SVG
- **Icons:** Lucide React

---

## 💻 Local Setup & Installation

### 1. Prerequisites
- Node.js 18+ (tested on Node v25)
- npm 9+

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/kaushalboii/cruseqr.git
cd cruseqr
npm install
```

### 3. Environment Configuration
Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```
Default `.env` configuration:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="cruseqr_ultra_secure_jwt_secret_token_change_in_production_32char"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
AI_PROVIDER="mock"
```

### 4. Database Setup & Seeding
```bash
# Push schema to SQLite
npx prisma db push

# Seed demo users, sample QR codes, analytics, and templates
node prisma/seed.js
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Production Deployment

### Option A: Vercel + Managed PostgreSQL (Supabase / Neon / AWS RDS)
1. In `prisma/schema.prisma`, update the datasource:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Set your environment variables in Vercel:
   - `DATABASE_URL` = `postgresql://user:pass@host:5432/cruseqr`
   - `JWT_SECRET` = `(generate a strong 64-char key)`
   - `NEXT_PUBLIC_APP_URL` = `https://yourdomain.com`
3. Deploy:
   ```bash
   vercel
   ```

### Option B: Docker / Node Server
```bash
npm run build
npm run start
```

---

## 🔑 External API Credentials Checklist (Optional for Production)

CruseQR is 100% functional out of the box using built-in high-contrast generative SVG synthesis, local SQLite, and mock providers. For external production cloud services, configure:

| Service | Environment Variable | Purpose |
|---|---|---|
| **Stripe** | `STRIPE_SECRET_KEY` & `STRIPE_WEBHOOK_SECRET` | Live card processing for subscriptions |
| **Stability AI / OpenAI** | `AI_API_KEY` | Optional external diffusion model backend |
| **S3 Storage** | `AWS_ACCESS_KEY_ID` & `AWS_SECRET_ACCESS_KEY` | Optional permanent CDN logo hosting |

---

## 📄 License
MIT © CruseQR Technologies Inc.

