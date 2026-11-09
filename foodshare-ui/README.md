# FoodShare — UI Design (Next.js + Tailwind)

Pixel-accurate UI implementation of the FoodShare design spec
("Food management & redistribution", Bengaluru). **UI only** — all data is
mocked client-side in a Zustand store, no backend required.

## Run it (in Antigravity or any terminal)

```bash
npm install
npm run dev        # http://localhost:3000
```

Production build: `npm run build && npm start`

## What's inside

| Screen | PDF pages | Where |
| --- | --- | --- |
| Landing (account chooser) | 1–2 | `src/components/foodshare/landing.tsx` |
| Login + Default/Focus/Error/Loading states | 3–4 | `src/components/foodshare/login.tsx` |
| Vendor registration (2-step form) | 5–6 | `src/components/foodshare/register.tsx` |
| Receiver registration (2-step form) | 7–8 | `src/components/foodshare/register.tsx` |
| Vendor dashboard (post food + donations) | 9–10 | `src/components/foodshare/vendor-dash.tsx` |
| Receiver dashboard (nearby feed + claims) | 11–12 | `src/components/foodshare/receiver-dash.tsx` |
| Admin dashboard (approval queue + KPIs) | 13–14 | `src/components/foodshare/admin-dash.tsx` |

All screens are responsive and reproduce the desktop **and** mobile layouts
from the spec. Navigation between screens is wired client-side:
landing → register → (auto-login) → role dashboard, plus a login screen with
all four form states.

## Key files

- `src/app/page.tsx` — view switcher for all screens
- `src/lib/foodshare/store.ts` — mock data + client-side navigation state
- `src/components/foodshare/ui.tsx` — shared header, footer, badges, alerts
- `src/app/globals.css` — FoodShare design tokens (`fs-*` colors)

## Notes

- Demo accounts (any password ≥ 6 chars):
  - Vendor: `annapurna.kitchen@foodshare.in`
  - Receiver: `asha.foundation@foodshare.in`
  - Admin: `admin@foodshare.org`
- The demo uses React state only; nothing is persisted.
