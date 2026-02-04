# Stripe + COD Setup

This project supports:
- Card payments via Stripe Checkout (currently disabled in checkout UI)
- COD / JazzCash / Easypaisa offline orders with customer info capture
- Admin orders view at `/admin`

## Frontend (`frontend`)
1. Create env file:

```bash
cp .env.example .env
```

2. Set backend URL:

```env
VITE_API_BASE_URL=http://localhost:5000
```

3. Run frontend:

```bash
npm install
npm run dev
```

## Backend (`backend`)
1. Create env file:

```bash
cp .env.example .env
```

2. Configure required vars:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
MONGODB_URI=
MONGODB_DB=bismillah_wholesale
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_CURRENCY=pkr
STRIPE_SUCCESS_URL=http://localhost:5173/?checkout=success
STRIPE_CANCEL_URL=http://localhost:5173/?checkout=cancelled
```

3. Optional email notifications:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
ORDER_NOTIFY_EMAIL=your_email@gmail.com
BRAND_LOGO_URL=/images/crown.svg
```

Where to get these values:
- `SMTP_HOST`: for Gmail use `smtp.gmail.com`
- `SMTP_PORT`: `587` (TLS) or `465` (SSL)
- `SMTP_USER`: your Gmail address
- `SMTP_PASS`: Google App Password (Google Account -> Security -> 2-Step Verification -> App passwords)
- `ORDER_NOTIFY_EMAIL`: inbox where you want admin order notifications
- `BRAND_LOGO_URL`: logo shown at top-center in emails (prefer full public URL in production)

4. Run backend:

```bash
npm install
npm run dev
```

## How customer info is captured
Checkout requires:
- Full name
- Email
- Phone
- Address
- ZIP code

### Offline payments (COD/JazzCash/Easypaisa)
Frontend calls:
- `POST /api/orders/offline`

Backend actions:
- Stores order in MongoDB when `MONGODB_URI` is set (recommended)
- Falls back to `backend/data/orders.json` when Mongo is not set
- Sends admin + customer emails only if SMTP is configured
- When order status is changed to `completed` from admin, customer receives completion email

### Card payment (Stripe)
Frontend calls:
- `POST /api/stripe/create-checkout-session`

Backend actions:
- Creates Stripe checkout session
- Returns `{ "url": "..." }`
- Frontend redirects customer to Stripe hosted checkout
