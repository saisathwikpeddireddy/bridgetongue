import { headers } from "next/headers";
import Link from "next/link";

import ConstructionLoop from "@/components/ConstructionLoop";

export const metadata = {
  title: "Bridgetongue — build a sentence",
};

// Sentences vary per visit, so the page is rendered per request.
export const dynamic = "force-dynamic";

/** FNV-1a. Small, stable, and good enough to spread request ids over seeds. */
function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Seed from the request rather than from Math.random().
 *
 * Render stays pure, which keeps it hydration-safe and lint-clean, and a
 * session becomes reproducible from its request id when someone reports that
 * an exercise graded oddly.
 */
async function requestSeed(): Promise<number> {
  const h = await headers();
  const id =
    h.get("x-vercel-id") ??
    h.get("x-request-id") ??
    h.get("x-amzn-trace-id") ??
    "local-development";
  return hash(id);
}

export default async function LearnPage() {
  const initialSeed = await requestSeed();

  return (
    <main className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
      <Link
        href="/"
        className="font-mono text-sm text-[var(--color-accent)] transition hover:opacity-70"
      >
        bridgetongue
      </Link>

      <div className="mt-16">
        <ConstructionLoop initialSeed={initialSeed} />
      </div>
    </main>
  );
}
