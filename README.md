# Matmatic

Mobile-first picture-mat dimension calculator for artists. Free.

## Dev

```bash
npm install
cp .env.example .env  # fill in Supabase URL + publishable key
npm run dev           # localhost:5173
npm test              # 20 regression tests
```

## Deploy

```bash
npm run deploy        # build + wrangler pages deploy
```

Requires `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` env vars.

## Stack

Vite + React + TypeScript + Tailwind + Capacitor (Phase 2 native wrap).
Hosted on Cloudflare Pages. Auth + DB via Supabase.

## License

MIT
