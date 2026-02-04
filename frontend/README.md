# Bismillah Wholesale Web App

Frontend web application for Bismillah Wholesale built with React + TypeScript + Vite.

## Tech stack
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion + GSAP
- Radix UI primitives

## Project structure
```text
src/
  app/
    layout.tsx
    page.tsx
  components/
    ui/
    wrapper.tsx
  context/
    CartContext.tsx
  hooks/
    use-cart.ts
  layout/
    navbar.tsx
    footer.tsx
    scroll-to-top.tsx
  providers/
    default-providers.tsx
  sections/
    Hero.tsx
    Products.tsx
    About.tsx
    Contact.tsx
    Cart.tsx
    Checkout.tsx
    Navigation.tsx
    Footer.tsx
  views/
    admin/
      orders-page.tsx
    home/
      main.tsx
```

## Getting started
```bash
npm install
npm run dev
```

## Environment variables
Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

## Available scripts
- `npm run dev` - start dev server
- `npm run build` - type-check and build
- `npm run lint` - run eslint
- `npm run preview` - preview production build

## Stripe checkout flow
- Card payments in `src/sections/Checkout.tsx` use Stripe Checkout redirect.
- Frontend calls: `POST {VITE_API_BASE_URL}/api/stripe/create-checkout-session`
- Frontend expects JSON response:

```json
{ "url": "https://checkout.stripe.com/c/pay/..." }
```

- Redirect helper: `src/lib/stripe.ts`

Backend endpoint should:
1) Create Stripe Checkout Session with line items from cart  
2) Return session URL  
3) Use secret key only on backend (`STRIPE_SECRET_KEY`)  

## Notes
- `src/app/layout.tsx` is the main shell (navbar, footer, cart, checkout, providers).
- `src/app/page.tsx` maps to the home page entry view.
- `/admin` shows the basic orders dashboard fed by backend order APIs.
- `src/components/wrapper.tsx` provides the shared container layout pattern.
