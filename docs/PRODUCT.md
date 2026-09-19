# Product

## What we are actually copying, and what we are not

The Language Transfer method (Mihalis Eleftheriou) is the origin of this idea.
Stripped of the audio format, four mechanisms are doing the work:

1. **Morphological bridges, not vocabulary.** Teach `-tion -> -ción`, not a
   word list. Vocabulary becomes a function you apply, not a list you memorize.
2. **Production before exposure.** The learner builds a sentence they have
   never heard, then finds out if they were right. The generation effect is why
   this sticks when flashcards do not.
3. **Expressive leverage.** Front-load structures with absurd payoff. `querer`
   plus an infinitive buys hundreds of sentences off one conjugated form.
   Expensive grammar is deliberately delayed.
4. **Explanation as mnemonic.** Understanding why the language does something
   replaces rote memory.

We are deriving our own curriculum from corpora. We are not reproducing his
sequence or his phrasing. That work is his, it is free and donation funded, and
the computed approach gives us an independent path anyway.

## Why now

This method is a dialogue, not content. The next question depends on the exact
mistake the learner just made, which before LLMs required a human teacher. The
only scalable format was recording one session and hoping. That is why the
category drifted toward gamified recognition: it was the part that could be
authored as fixed assets.

## The wedge

Be honest about where the source method falls down, because it is our
differentiation. Its graduates report the same two things: they construct
beautifully in their head and then freeze in real conversation, and their
listening comprehension lags their grammar badly. The method builds
understanding, not retrieval speed.

So this is not "Language Transfer as an app". It is the transfer engine as the
onramp, plus the two things the audio format structurally cannot do:
**latency training** and **comprehension**.

This is why `attempts.latency_ms` exists in the schema from day one. Time to
produce is a first-class metric, not an afterthought. "You know this but it
takes you four seconds" is the fluency gap, and nobody surfaces it.

## Design commitments

- **No word banks.** Tapping tiles is recognition wearing recall's clothes.
  Free text or nothing.
- **Never show the answer before the attempt.** This is the one thing to be
  religious about.
- **The LLM explains, it does not judge.** Grading free-form production with a
  model will accept wrong things and reject right things, and being corrected
  incorrectly destroys trust faster than anything else. Constrain the
  construction space so correctness is mostly deterministic, then use the model
  for the "here is why" and the error diagnosis.
- **Coverage, not streaks.** A streak measures compliance. Show the share of
  running speech the learner can follow. It is honest, it is computable, and it
  climbs fast early because frequency is Zipfian.
- **Finishable.** Duolingo is an infinite treadmill by design. "Conversational
  in eight weeks, then go talk to people" is what adults actually want.

## Where the thesis breaks

Language distance is the hard constraint. This is strongest English to Romance,
decent English to Germanic, and degrades badly for Mandarin, Japanese and
Arabic where lexical transfer is near zero. Structural and conceptual transfer
still apply, and Japanese has the katakana loanword layer, but do not build the
pitch on a market we cannot serve. Nail Spanish, prove the loop, then find out
empirically where the curve falls off.

## Open questions

- Which wedge to lead with: the cognate unlock as hook with retrieval speed as
  retention, or a pure comprehension product (understand native speech fast,
  production later).
- Whether the synthetic co-learner (an AI peer who makes plausible errors and
  gets corrected in front of you) is magic or gimmick. Cheap to test.
