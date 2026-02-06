# itsgyno

Next.js 15 App Router project for gynecomastia image analysis using OpenAI Vision.

## Current scope
- Upload chest image from the frontend (`app/page.js`)
- Send `imageBase64` + `prompt` to `POST /api/analyze`
- Analyze image in `app/api/analyze/route.js` via OpenAI Responses API
- Display verdict + explanation on `app/results/page.js`

## Setup (after installing dependencies)
1. Create `.env.local` and set `OPENAI_API_KEY`.
2. Install dependencies.
3. Run `npm run dev`.

## Notes
- No DB/storage in v1.
- Images are handled in memory and not persisted.
