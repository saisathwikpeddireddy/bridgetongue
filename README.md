# Bridgetongue

Language learning by transfer. Instead of starting an adult learner at zero,
Bridgetongue maps the language they already know onto the one they want.

## The thesis

Roughly sixty percent of English vocabulary is Latinate. An English speaker
approaching Spanish is not missing the words, they are missing the mapping
function. Teach the mapping and thousands of words arrive at once.

So the unit of curriculum here is not a word. It is a **rule that converts
words the learner already owns**:

```
-tion  ->  -ción      nation, information, constitution, operation ...
-ty    ->  -dad       university, reality, possibility, community ...
-ous   ->  -oso       famous, delicious, generous ...
```

Two consequences shape the whole codebase:

1. **The curriculum is computed, not authored.** A new language pair is a
   pipeline run over corpora, not a content team. See `docs/ARCHITECTURE.md`.
2. **We model the learner's L1.** Because we know they speak English, we can
   predict the errors they will make before they make them. Generic courses
   cannot do this, because they serve every L1 from one syllabus.

Longer product reasoning lives in `docs/PRODUCT.md`.

## Status

Pre-alpha. What exists today:

- the transfer engine (`src/lib/transfer/`), with a tested English to Spanish
  rule set and a derivation pass for words it has never seen
- the coverage model, which is the progress metric that replaces streaks
- the landing page, which is the thirty-second proof of the thesis
- the database schema for the learner loop (`src/lib/db/schema.ts`), not yet wired

What does not exist yet: the construction loop, accounts, scheduling, audio.

**The numbers rendered in the UI are modelled estimates, not measurements.**
They are placeholders so the interface has something honest-shaped to show, and
they are marked as such in the source. Do not quote them publicly until the
corpus pipeline lands.

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
```

No database is required. The transfer engine is pure and the landing page is
static, so a fresh clone runs with nothing configured.

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Stack

| Concern    | Choice                                         |
| ---------- | ---------------------------------------------- |
| Framework  | Next.js 16 (App Router), React 19, TypeScript   |
| Styling    | Tailwind CSS v4                                |
| Database   | Neon Postgres via Drizzle ORM                  |
| Hosting    | Vercel                                         |
| Tests      | Vitest                                         |

The API routes are the eventual mobile backend, which is why the domain logic
lives in `src/lib/` with no React dependency. A React Native client should be
able to import the transfer engine unchanged.

## Deploying

1. Import the repo at [vercel.com/new](https://vercel.com/new). The framework
   is detected automatically and needs no build configuration.
2. Add the Neon integration from the Vercel marketplace and attach it to the
   project. It sets `DATABASE_URL` for you.
3. Copy any remaining keys from `.env.example` into project environment
   variables.
4. `GET /api/health` reports service and database status on a deployment.

Nothing in the app fails when `DATABASE_URL` is absent, so preview deployments
work before the database exists.

## Layout

```
src/
  app/                  routes; api/health is the deploy smoke test
  components/           React; DecodeProof is the landing-page proof
  lib/
    transfer/           the engine: types, rules, apply, coverage
    db/                 Drizzle schema and lazy client
docs/
  ARCHITECTURE.md       how the transfer graph gets computed
  PRODUCT.md            the thesis, the wedge, what we are not building
```
