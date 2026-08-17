# ZenLingo Personal Learning Hub

React and Vite learning dashboard with client-side routes and durable browser
progress.

## Requirements

Use Node 24 (`>=24.0.0 <25`) and npm.

## Local workflow

```sh
nvm use
npm ci
npx playwright install chromium
npm run verify
```

Run the app locally with `npm run dev`. The CI workflow uses the same `npm ci`
then `npm run verify` sequence on Node 24. Verification includes formatting,
lint, strict type checking, per-file coverage thresholds, a production build,
and a real Chromium E2E/accessibility suite against the production preview.

## Browser persistence

Learning progress is stored locally in the current browser. ZenLingo validates
the versioned payload before use, restores goal completion onto the canonical
goal copy, and discards corrupt or obsolete data. Flashcard face orientation is
session-only and is never persisted. There is no backend, account, or cross-
device synchronization.

## SPA deployment

ZenLingo uses `BrowserRouter`, so the host must serve `index.html` for app URLs
that do not match a static file. This repository includes both supported host
configurations:

- Netlify uses `netlify.toml` with a `/*` status-200 rewrite.
- Vercel uses `vercel.json` with a catch-all rewrite to `/index.html`.

The supported direct paths are `/`, `/writing`, `/flashcards`, `/recall`,
`/notes`, and `/stats`. `npm run test:e2e` builds the production bundle, starts
its preview server, executes JavaScript at every direct path in Chromium,
checks persisted Writing completion after reload, fails on browser console/page
errors, and runs axe (including color contrast) on every route plus the open
Notes modal and mobile drawer.

`npm run test:preview` remains available as a fast transport-only check that
all six paths return HTML. It does not execute application JavaScript and is
not described as a browser smoke test.
