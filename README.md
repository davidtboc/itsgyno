# itsgyno

Next.js 15 App Router project for gynecomastia image analysis using OpenAI Vision.

## Current scope
- Upload one or two chest images from the frontend (`app/page.js`)
- On `Submit`, redirect user to Stripe Checkout paywall (`POST /api/checkout`)
- Only after successful payment, run analysis (`POST /api/analyze`)
- Verify payment status server-side before analysis
- Display verdict + explanation on `app/results/page.js`

## Setup (after installing dependencies)
1. Create `.env.local` with:
   - `OPENAI_API_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PRICE_ID`
   - `STRIPE_WEBHOOK_SECRET` (for webhook verification)
   - `NEXT_PUBLIC_APP_URL` (for checkout redirects, e.g. `http://localhost:3000`)
2. Install dependencies.
3. Run `npm run dev`.

## Stripe Production Checklist
- Use live Stripe keys in production:
  - `STRIPE_SECRET_KEY=sk_live_...`
  - `STRIPE_PRICE_ID=price_...` (live price)
- Set `NEXT_PUBLIC_APP_URL` to your deployed HTTPS domain.
- Configure webhook endpoint in Stripe:
  - URL: `https://your-domain.com/api/stripe-webhook`
  - Events: `checkout.session.completed` (and optional async payment events)
  - Set returned signing secret as `STRIPE_WEBHOOK_SECRET`.
- Deploy and run a live checkout test with a real card and a low-value live price.

## Notes
- No DB/storage in v1.
- Images are held in browser session storage during checkout redirect, then removed after analysis starts.
