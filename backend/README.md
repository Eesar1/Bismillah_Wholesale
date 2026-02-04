# Bismillah Wholesale API

Express backend for orders, inventory, and email notifications.

## Local setup
```bash
npm install
cp .env.example .env
npm run dev
```

## Storage mode
- If `MONGODB_URI` is set: uses MongoDB (recommended for Vercel/production)
- If `MONGODB_URI` is empty: uses local JSON files in `data/`

## Endpoints
- `GET /health`
- `GET /api/products/availability`
- `GET /api/orders`
- `PATCH /api/orders/:orderId/status`
- `POST /api/orders/offline`
- `POST /api/stripe/create-checkout-session`
- `POST /api/stripe/webhook`
- `GET /api/stripe/session/:sessionId`

## Vercel deployment
This backend is Vercel-ready via:
- `api/index.js`
- `vercel.json`

Set Vercel env vars:
- `MONGODB_URI`
- `MONGODB_DB` (optional)
- `FRONTEND_URL`
- `STRIPE_SECRET_KEY` (if/when card enabled)
- `STRIPE_CURRENCY=pkr`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `ORDER_NOTIFY_EMAIL`
- `BRAND_LOGO_URL` (use public URL, e.g. `https://your-frontend.vercel.app/images/crown.svg`)

## Email images
Use public URLs so emails work everywhere (local + Vercel):
- Product images are resolved from `FRONTEND_URL + /images/...`
- Logo is from `BRAND_LOGO_URL`
