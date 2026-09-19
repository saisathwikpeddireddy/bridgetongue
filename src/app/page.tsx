import Link from "next/link";

import DecodeProof from "@/components/DecodeProof";
import { EN_ES_ESTIMATED_UNLOCK } from "@/lib/transfer/rules";
import { formatCoverage, tokenCoverage } from "@/lib/transfer/coverage";

export default function Home() {
  const firstThousand = formatCoverage(tokenCoverage(1000));

  return (
    <main className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
      <header className="mb-20">
        <p className="font-mono text-sm tracking-tight text-[var(--color-accent)]">
          bridgetongue
        </p>
        <h1 className="mt-6 font-[family-name:var(--font-serif)] text-4xl leading-tight sm:text-5xl">
          You already speak more Spanish than you think.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--color-muted)]">
          Most courses start you at zero. You are not at zero. Roughly sixty
          percent of English vocabulary is Latinate, which means the hard part
          was done centuries before you were born. What you are missing is not
          the words. It is the mapping.
        </p>
      </header>

      <DecodeProof />

      <section className="mt-24 border-t border-[var(--color-line)] pt-12">
        <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
          Now build one yourself
        </h2>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--color-muted)]">
          Reading is the easy half. The rest of the method is producing
          sentences you have never seen, before anyone shows you the answer.
          No word banks, no multiple choice.
        </p>
        <Link
          href="/learn"
          className="mt-7 inline-block rounded-full border border-[var(--color-accent)] px-7 py-3 text-sm text-[var(--color-accent)] transition hover:bg-[var(--color-accent)] hover:text-[var(--color-ink)]"
        >
          Start building
        </Link>
      </section>

      <section className="mt-24 border-t border-[var(--color-line)] pt-12">
        <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
          Why this works
        </h2>
        <div className="mt-6 grid gap-8 sm:grid-cols-3">
          <div>
            <p className="font-[family-name:var(--font-serif)] text-3xl text-[var(--color-accent)]">
              ~{EN_ES_ESTIMATED_UNLOCK.toLocaleString()}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
              words reachable from English through a handful of transformation
              rules, before you learn a single new word.
            </p>
          </div>
          <div>
            <p className="font-[family-name:var(--font-serif)] text-3xl text-[var(--color-accent)]">
              {firstThousand}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
              of everything said in normal Spanish conversation is covered by
              the first thousand words. Frequency is brutally lopsided, and that
              is good news.
            </p>
          </div>
          <div>
            <p className="font-[family-name:var(--font-serif)] text-3xl text-[var(--color-accent)]">
              0
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
              word banks. You produce the sentence before you are shown it, or
              you have not learned anything.
            </p>
          </div>
        </div>
      </section>

      <footer className="mt-24 border-t border-[var(--color-line)] pt-8 text-sm text-[var(--color-muted)]">
        <p>
          Pre-alpha. The numbers above are modelled estimates pending the corpus
          pipeline, not measurements.
        </p>
      </footer>
    </main>
  );
}
