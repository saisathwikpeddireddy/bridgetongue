"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import { buildSession, type Exercise } from "@/lib/exercise/generate";
import { grade, type Grade } from "@/lib/exercise/grade";

/**
 * The construction loop.
 *
 * The learner is given a meaning and must produce it before seeing anything.
 * No word bank, no multiple choice: recognition is not recall, and the
 * generation effect is the entire reason this works.
 *
 * Latency is measured from the first keystroke, not from render, so thinking
 * time before committing is not counted as fluency.
 *
 * The seed arrives from the server so that the first session is identical on
 * both sides of hydration. Reseeding afterwards happens in an event handler,
 * which is a safe place for randomness.
 */

const SESSION_LENGTH = 14;

interface Result {
  exercise: Exercise;
  grade: Grade;
  latencyMs: number | null;
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

export default function ConstructionLoop({ initialSeed }: { initialSeed: number }) {
  const [seed, setSeed] = useState(initialSeed);

  const session = useMemo(() => buildSession(SESSION_LENGTH, seed), [seed]);

  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const firstKeyAt = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const exercise = session[index];
  const done = index >= session.length;

  const submit = useCallback(() => {
    if (!exercise || result) return;
    const g = grade(exercise, value);
    const latencyMs = firstKeyAt.current ? Math.round(performance.now() - firstKeyAt.current) : null;
    const r = { exercise, grade: g, latencyMs };
    setResult(r);
    // An unattempted prompt is not a data point about fluency.
    if (g.errorTag !== "empty") setResults((prev) => [...prev, r]);
  }, [exercise, result, value]);

  const next = useCallback(() => {
    setResult(null);
    setValue("");
    firstKeyAt.current = null;
    setIndex((i) => i + 1);
    inputRef.current?.focus();
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (result) next();
    else submit();
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (firstKeyAt.current === null && e.target.value.length > 0) {
      firstKeyAt.current = performance.now();
    }
    setValue(e.target.value);
  };

  const scored = results.filter((r) => r.grade.errorTag !== "empty");
  const correct = scored.filter((r) => r.grade.correct).length;
  const medianLatency = median(
    scored.filter((r) => r.grade.correct && r.latencyMs).map((r) => r.latencyMs!),
  );

  if (done) {
    const tags = scored
      .filter((r) => !r.grade.correct && r.grade.errorTag)
      .reduce<Record<string, number>>((acc, r) => {
        acc[r.grade.errorTag!] = (acc[r.grade.errorTag!] ?? 0) + 1;
        return acc;
      }, {});

    return (
      <div className="space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
            Session complete
          </p>
          <p className="mt-4 font-[family-name:var(--font-serif)] text-4xl">
            {correct} of {scored.length}
          </p>
          {medianLatency !== null && (
            <p className="mt-3 text-[var(--color-muted)]">
              Median time to produce a correct sentence:{" "}
              <span className="text-[var(--color-paper)]">
                {(medianLatency / 1000).toFixed(1)}s
              </span>
              . This is the number that matters. Knowing a sentence and being
              able to say it are different skills, and only one of them shows
              up in a conversation.
            </p>
          )}
        </div>

        {Object.keys(tags).length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
              Where it went wrong
            </p>
            <ul className="mt-3 space-y-1 text-sm text-[var(--color-muted)]">
              {Object.entries(tags).map(([tag, n]) => (
                <li key={tag}>
                  <span className="font-mono text-[var(--color-paper)]">
                    {tag.replace(/_/g, " ")}
                  </span>{" "}
                  &times;{n}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={() => {
            setSeed(Math.floor(Math.random() * 1e9));
            setIndex(0);
            setResults([]);
            setResult(null);
            setValue("");
            firstKeyAt.current = null;
          }}
          className="rounded-full border border-[var(--color-line)] px-6 py-3 text-sm transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          Go again with new sentences
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between text-xs text-[var(--color-muted)]">
        <span className="font-mono">
          {index + 1} / {session.length}
        </span>
        <span className="font-mono uppercase tracking-[0.15em]">
          {exercise.patternLabel}
        </span>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
          Say this in Spanish
        </p>
        <p className="mt-4 font-[family-name:var(--font-serif)] text-3xl leading-snug sm:text-4xl">
          {exercise.prompt}
        </p>
      </div>

      <input
        ref={inputRef}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        // readOnly, not disabled: a disabled input receives no key events, which
        // would silently break "press Enter for the next one".
        readOnly={!!result}
        autoFocus
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        placeholder="type it, do not look it up"
        aria-label="Your Spanish sentence"
        className={`w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-ink-soft)] px-5 py-4 font-mono text-lg outline-none transition focus:border-[var(--color-accent)] ${result ? "opacity-60" : ""}`}
      />

      {!result ? (
        <button
          onClick={submit}
          className="rounded-full border border-[var(--color-line)] px-6 py-3 text-sm transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          Check it
        </button>
      ) : (
        <div className="space-y-5">
          <div
            className={`rounded-lg border p-5 ${
              result.grade.correct
                ? "border-[var(--color-accent-soft)] bg-[var(--color-ink-soft)]"
                : "border-red-900/50 bg-red-950/20"
            }`}
          >
            <p
              className={`font-[family-name:var(--font-serif)] text-2xl ${
                result.grade.correct ? "text-[var(--color-accent)]" : "text-red-300"
              }`}
            >
              {result.grade.correct
                ? result.grade.nearMiss
                  ? "Almost exactly right"
                  : "Correct"
                : "Not yet"}
            </p>
            <p className="mt-3 leading-relaxed text-[var(--color-muted)]">
              {result.grade.message}
            </p>
            {result.latencyMs !== null && result.grade.correct && (
              <p className="mt-3 font-mono text-xs text-[var(--color-muted)]">
                {(result.latencyMs / 1000).toFixed(1)}s to produce
              </p>
            )}
          </div>

          <details className="text-sm text-[var(--color-muted)]">
            <summary className="cursor-pointer transition hover:text-[var(--color-paper)]">
              Why this works the way it does
            </summary>
            <p className="mt-3 leading-relaxed">{exercise.note}</p>
          </details>

          <button
            onClick={next}
            className="rounded-full border border-[var(--color-line)] px-6 py-3 text-sm transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            Next
          </button>
        </div>
      )}

      <p className="text-xs text-[var(--color-muted)]">
        Press Enter to check, Enter again for the next one.
      </p>
    </div>
  );
}
