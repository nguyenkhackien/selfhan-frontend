# SelfHan Frontend

React and Vite learner application for SelfHan. It consumes the current NestJS
foundation API and presents the Vietnamese-first Level → Unit → Lesson learning
path with a responsive green sidebar layout.

## Requirements

- Node 24 (`>=24.0.0 <25`)
- The backend stack running on `http://localhost:3000`

## Local workflow

```sh
nvm use
npm ci
npx playwright install chromium
npm run verify
```

Start the backend first, then run `npm run dev` in this directory. By default,
the frontend calls `http://localhost:3000/api/v1`. Set `VITE_API_BASE_URL` when
the API is served from another origin.

## Implemented foundation routes

- `/` and `/levels`: published Level catalogue
- `/levels/:slug`: Units in a Level
- `/units/:slug`: Lessons in a Unit
- `/lessons/:slug`: vocabulary, Pinyin, Vietnamese meanings, examples, grammar,
  optional audio, and browser-only handwriting canvas
- `/login` and `/register`: credentialed auth flows using the access token in
  memory and the backend's HttpOnly refresh cookie

The browser never stores refresh tokens or learner progress. Quiz attempts,
flashcard outcomes, dashboard/streak, and admin CRUD are deliberately absent
until the corresponding backend contracts exist.

## HSK data attribution

The current HSK data foundation is stored and imported locally by the backend;
the browser does not call a source repository, dictionary, or translation API
at runtime. The shared application footer attributes vocabulary data to
[CVDICT](https://github.com/ph0ngp/CVDICT) and
[CC-CEDICT](https://cc-cedict.org/wiki/) under
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

HSK browsing, export, and the three-mode character-writing flow are not yet
learner routes. Any future vocabulary export must retain the same attribution
in its metadata.

## Quality gates

`npm run verify` checks formatting, lint, TypeScript, per-file coverage,
production build, and Playwright accessibility/E2E tests for the Level → Unit
→ Lesson flow at desktop and mobile widths.

## SPA deployment

The app uses `BrowserRouter`; Netlify and Vercel rewrite direct route requests
to `index.html` through the supplied configuration files.
