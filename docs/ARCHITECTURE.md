# Architecture

## The core object: the transfer graph

The IP here is not the tutor. Everyone has a model. It is the **ordered,
measured transfer graph** for a language pair, plus per-learner mastery state
against it.

A graph node (`concepts` in the schema) is one of:

| Kind            | Example                                               |
| --------------- | ----------------------------------------------------- |
| `transfer_rule` | `-tion -> -ción`                                      |
| `structure`     | `querer` + infinitive                                 |
| `lexeme`        | a high-frequency word no rule reaches (`pero`, `ya`)  |
| `false_friend`  | `sensible` means sensitive, not sensible              |
| `phonology`     | Spanish `r` vs `rr`, where English intuition misfires |

Each node carries a `rank`. Ranking is the whole game, and it is a computable
objective: **expressive yield per unit of learning cost.** Yield is the
frequency-weighted count of things the learner can newly say or understand.
Cost is how much has to be memorized rather than derived. A rule that unlocks
2,400 words for one line of explanation outranks an irregular verb every time.

Because ranking is computed, a new language pair is a pipeline run rather than
a content team. That is the scaling story, and it is what makes non-English L1s
(Hindi to Spanish, Portuguese to French) a job rather than a company-sized bet.

## The pipeline (not built yet)

Current rule data in `src/lib/transfer/rules.ts` is hand-seeded so the product
has something real to render. It is explicitly marked as estimate, not
measurement. The pipeline that replaces it:

1. **Lexicon extraction.** Wiktionary dumps plus Open Multilingual WordNet give
   form, sense and etymology per language.
2. **Cognate alignment.** Pair L1 and L2 lemmas sharing an etymon. Derive
   candidate suffix correspondences by aligning the aligned pairs.
3. **Rule induction.** Keep correspondences above a support threshold. Each
   surviving rule gets measured precision against the held-out lexicon, which
   is what turns `estWords` into a real number.
4. **Frequency weighting.** Score each rule by the token mass it unlocks, using
   an OpenSubtitles-derived frequency list (spoken register, which matters more
   than written for this product).
5. **False-friend detection.** Where a rule output collides with a real L2 word
   whose sense is distant from the L1 input, flag it. These are the highest
   value things to teach, because the learner will otherwise be confidently
   wrong.
6. **Negative transfer.** Where L1 structure predicts an L2 error, record it as
   a concept in its own right.

Output is a versioned JSON artifact seeded into `concepts`.

The `attempts` table closes the loop: it records which L1 speakers make which
errors on which concepts, which is exactly the signal needed to re-rank the
graph and to predict errors before they happen.

## Why the domain logic has no React in it

`src/lib/` is framework free on purpose. Web is first, mobile is next, and the
transfer engine and coverage model should import unchanged into a React Native
client. Anything that touches the DOM lives in `src/components/` or
`src/app/`.

The API routes under `src/app/api/` are the eventual mobile backend. Keeping
them thin, with logic in `src/lib/`, is what avoids a rewrite at that point.

## Grading, and why it is mostly deterministic

Free-form production graded by an LLM will sometimes accept wrong answers and
sometimes reject right ones. Being corrected incorrectly is the fastest way to
lose a learner's trust.

So the construction exercise constrains the target: the prompt is generated
such that the set of acceptable answers is enumerable from the learner's known
concepts. The grader is a comparison against that set, with normalization for
accents and clitic placement. The model is invoked only afterwards, to explain
*why* a rejected answer was rejected and to classify the error into
`attempts.error_tag`.

## Database

Neon Postgres over HTTP via `drizzle-orm/neon-http`, which suits serverless
function invocations better than a pooled TCP client.

`getDb()` returns `null` when `DATABASE_URL` is unset rather than throwing.
This is deliberate: a fresh clone and every preview deployment must run without
a database, so the thesis can be demonstrated before any infrastructure exists.
