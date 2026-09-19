/**
 * Coverage: the progress metric.
 *
 * Duolingo shows you a streak. A streak measures your compliance, not your
 * ability. We show the share of running speech a learner can follow, which is
 * the thing they actually came for and which climbs fast early because
 * vocabulary frequency is Zipfian.
 *
 * WARNING: the anchors below are a stand-in curve so the UI has something
 * honest-shaped to render. Replace with measured coverage against an
 * OpenSubtitles-derived Spanish frequency list before showing this to a user
 * as fact. See docs/ARCHITECTURE.md.
 */

/** [known lemmas, approximate share of tokens in running speech]. */
const ANCHORS: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [100, 0.49],
  [500, 0.67],
  [1000, 0.76],
  [2000, 0.82],
  [3000, 0.85],
  [5000, 0.89],
  [10000, 0.93],
  [20000, 0.96],
];

/**
 * Estimated share of tokens in running speech covered by `knownLemmas`.
 * Log-interpolated between anchors, because the underlying curve is roughly
 * linear in log(rank).
 */
export function tokenCoverage(knownLemmas: number): number {
  const n = Math.max(0, knownLemmas);
  if (n === 0) return 0;

  for (let i = 1; i < ANCHORS.length; i++) {
    const [x0, y0] = ANCHORS[i - 1];
    const [x1, y1] = ANCHORS[i];
    if (n <= x1) {
      const lo = x0 === 0 ? 1 : x0;
      const t = (Math.log(n) - Math.log(lo)) / (Math.log(x1) - Math.log(lo));
      return y0 + Math.max(0, Math.min(1, t)) * (y1 - y0);
    }
  }
  return ANCHORS[ANCHORS.length - 1][1];
}

/** How many more lemmas to move coverage up by `delta` (e.g. 0.01 = one point). */
export function lemmasForNextPoint(knownLemmas: number, delta = 0.01): number {
  const target = tokenCoverage(knownLemmas) + delta;
  let n = knownLemmas;
  // Coarse then fine; the curve is monotone so this terminates quickly.
  while (n < 40000 && tokenCoverage(n) < target) n += 25;
  return n - knownLemmas;
}

export function formatCoverage(share: number): string {
  return `${Math.round(share * 100)}%`;
}
