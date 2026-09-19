"use client";

import { useMemo, useState } from "react";

import { transfer } from "@/lib/transfer/apply";
import { EN_ES_RULES } from "@/lib/transfer/rules";

/**
 * The thirty-second proof.
 *
 * The entire hypothesis is that an English speaker can read Spanish they have
 * never studied. Rather than claim that, this makes them do it, then shows the
 * rules that made it possible, then hands them the rules to test themselves.
 *
 * Deliberately has no backend: the argument has to land before signup.
 */

const SENTENCE = [
  { es: "La", cognate: false },
  { es: "construcción", cognate: true },
  { es: "de", cognate: false },
  { es: "la", cognate: false },
  { es: "civilización", cognate: true },
  { es: "moderna", cognate: true },
  { es: "es", cognate: false },
  { es: "una", cognate: false },
  { es: "transformación", cognate: true },
  { es: "social", cognate: true },
] as const;

const GLOSS = "The construction of modern civilization is a social transformation.";

const SHOWCASE_RULE_IDS = ["tion-cion", "ty-dad", "ic-ico", "ous-oso", "al-al"];

export default function DecodeProof() {
  const [revealed, setRevealed] = useState(false);
  const [word, setWord] = useState("");

  const showcase = useMemo(
    () => EN_ES_RULES.filter((r) => SHOWCASE_RULE_IDS.includes(r.id)),
    [],
  );

  const result = useMemo(() => (word ? transfer(word) : null), [word]);
  const attempted = word.trim().length > 2;

  return (
    <div className="space-y-12">
      {/* Step 1: make them read it. */}
      <section>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
          You have never studied Spanish. Read this.
        </p>
        <p className="mt-5 font-[family-name:var(--font-serif)] text-2xl leading-relaxed sm:text-4xl sm:leading-[1.35]">
          {SENTENCE.map((token, i) => (
            <span key={i}>
              <span
                className={
                  token.cognate && revealed
                    ? "border-b-2 border-[var(--color-accent)] text-[var(--color-accent)] transition-colors duration-500"
                    : "transition-colors duration-500"
                }
              >
                {token.es}
              </span>
              {i < SENTENCE.length - 1 ? " " : ""}
            </span>
          ))}
        </p>

        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="mt-8 rounded-full border border-[var(--color-line)] px-6 py-3 text-sm text-[var(--color-paper)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            I think I understood that
          </button>
        ) : (
          <div className="mt-8 space-y-3">
            <p className="text-lg text-[var(--color-muted)]">{GLOSS}</p>
            <p className="text-lg">
              You were right, and nobody taught you. Five of those ten words are
              words you already owned in English.
            </p>
          </div>
        )}
      </section>

      {/* Step 2: show the machinery. */}
      {revealed && (
        <section className="space-y-6">
          <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
            The rules that did it
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {showcase.map((rule) => (
              <li
                key={rule.id}
                className="rounded-lg border border-[var(--color-line)] bg-[var(--color-ink-soft)] p-4"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-mono text-sm text-[var(--color-accent)]">
                    {rule.label}
                  </span>
                  <span className="shrink-0 text-xs text-[var(--color-muted)]">
                    ~{rule.estWords.toLocaleString()} words
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                  {rule.note}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Step 3: hand them the rule and let them break it. */}
      {revealed && (
        <section className="space-y-5">
          <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
            Try it yourself
          </h2>
          <p className="text-[var(--color-muted)]">
            Type any English word ending in{" "}
            <span className="font-mono text-[var(--color-paper)]">-tion</span>,{" "}
            <span className="font-mono text-[var(--color-paper)]">-ty</span>,{" "}
            <span className="font-mono text-[var(--color-paper)]">-ous</span>,{" "}
            <span className="font-mono text-[var(--color-paper)]">-ic</span> or{" "}
            <span className="font-mono text-[var(--color-paper)]">-al</span>. We
            will not look it up. We will derive it.
          </p>

          <input
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="revolution"
            spellCheck={false}
            autoComplete="off"
            className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-ink-soft)] px-5 py-4 font-mono text-lg outline-none transition focus:border-[var(--color-accent)]"
          />

          <div className="min-h-24">
            {result && (
              <div className="rounded-lg border border-[var(--color-accent-soft)] bg-[var(--color-ink-soft)] p-5">
                <p className="font-[family-name:var(--font-serif)] text-3xl text-[var(--color-accent)]">
                  {result.output}
                </p>
                <p className="mt-3 font-mono text-xs text-[var(--color-muted)]">
                  {result.ruleLabel}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                  {result.note}
                </p>
                {result.falseFriend && (
                  <p className="mt-3 rounded border border-red-900/50 bg-red-950/30 p-3 text-sm text-red-300">
                    Careful. <strong>{result.falseFriend.form}</strong> is a real
                    Spanish word, but it means{" "}
                    <strong>{result.falseFriend.actuallyMeans}</strong>, not{" "}
                    {result.falseFriend.looksLike}.
                  </p>
                )}
                {result.caveat && (
                  <p className="mt-3 text-xs text-[var(--color-muted)]">
                    {result.caveat}
                  </p>
                )}
              </div>
            )}
            {!result && attempted && (
              <p className="text-sm text-[var(--color-muted)]">
                No rule covers that one yet. That is a real answer, not a
                failure: the method has edges, and knowing where they are is
                part of learning it.
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
