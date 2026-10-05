# CHEATCODE™ Website

Premium high-protein ice cream launch website for CHEATCODE.

## Stack
- React 19
- Vite 7
- CSS

## Brand
- Tagline: You Can Cheat Without Regret.
- USP: 10g Protein · 0 Added Sugar · High Fibre · Low Carb
- Launch: 11 October 2026
- Instagram: @houseofcheatcode

## Run locally
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```


## CHEATCODE Orders Setup

1. Run `supabase/orders.sql` in the Supabase SQL Editor.
2. Add these Vercel environment variables: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`.
3. In Razorpay Dashboard, create a webhook pointing to `https://YOUR-DOMAIN/api/razorpay-webhook` and subscribe to `payment.captured` and `payment.failed`.
4. Open `/admin/orders` and use the value of `ADMIN_PASSWORD` to view/manage orders.

Never expose the Razorpay secret, webhook secret, Supabase service-role key, or admin password in client-side code.
