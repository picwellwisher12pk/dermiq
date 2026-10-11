# DermIQ - AI Skin Health & Skincare Virtual Try-On (VTO)

**DermIQ** is a mobile-first web application built for the **YouCam API Skin AI & eCommerce VTO Hackathon**. It provides immediate skin health analysis from a quick selfie, estimates skin hydration, texture, spots, and fine lines, and allows users to preview personalized clinical skincare formulas directly on their face with an interactive augmented reality before/after slider.

---

## Key Features
- **Mobile-First Selfie Camera:** Built-in webcam capture with an alignment guide and front/rear camera switcher.
- **AI Skin Health Analysis:** Connects to Perfect Corp's YouCam S2S v2.0 API (`https://yce-api-01.makeupar.com`) with fallback dynamic pixel diagnostics.
- **Skin Health Summary:** 0-100 overall health score, estimated skin age, and individualized moisture, texture, spot, and wrinkle indices.
- **Interactive Virtual Try-On (VTO):** Draggable before/after comparison slider powered by CSS polygon masking for stationary face alignment.
- **Prescription Product Marketplace:** Tailored dermatological formulations matching the user's specific skin concerns.

---

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Runtime & Package Manager:** Bun
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Celebration Effects:** Canvas Confetti

---

## Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/picwellwisher12pk/dermiq.git
cd dermiq
bun install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
YOUCAM_API_KEY=your_youcam_api_key
YOUCAM_API_SECRET=your_youcam_api_secret
YOUCAM_API_URL=https://yce-api-01.makeupar.com
NEXT_PUBLIC_ENABLE_REAL_YOUCAM_API=true
```

### 3. Run Development Server
```bash
bun run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Production Build & Deployment
```bash
bun run build
bun run start
```
Can be deployed seamlessly on **Vercel**, **Railway**, **Render**, or any Node.js/Docker host.
