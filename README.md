# Bismillah Monorepo

This repository contains both apps:

- `frontend/` - React + Vite storefront
- `backend/` - Express API (orders, inventory, emails)

## Recommended repo strategy

Keep both in this single folder/repo (monorepo).  
On Vercel, create **two projects** from the same repo:

1. `bismillah-frontend` with Root Directory = `frontend`
2. `bismillah-backend` with Root Directory = `backend`

## Local run

Backend:
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Frontend:
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Vercel deployment

### 1) Deploy backend (Root `backend`)
Set env vars in Vercel backend project:
- `FRONTEND_URL` = your frontend Vercel URL
- `MONGODB_URI` = your MongoDB Atlas URI
- `MONGODB_DB` = `bismillah_wholesale` (or custom)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `ORDER_NOTIFY_EMAIL`
- `BRAND_LOGO_URL` = full public URL (recommended)
- Stripe vars if/when needed (`STRIPE_SECRET_KEY`, etc.)

### 2) Deploy frontend (Root `frontend`)
Set env var in Vercel frontend project:
- `VITE_API_BASE_URL` = your backend Vercel URL

Redeploy frontend after changing `VITE_API_BASE_URL`.

## Public image URLs for emails

Use public URLs in backend env:
- `BRAND_LOGO_URL=https://<frontend-domain>/images/crown.svg`
- Product images already resolve from `FRONTEND_URL + /images/...`

This works on Vercel and local.
