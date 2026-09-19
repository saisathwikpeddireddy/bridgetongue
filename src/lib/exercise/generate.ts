import { PATTERNS, type Pattern, type SlotOption } from "@/lib/curriculum/patterns";

export interface Exercise {
  id: string;
  patternId: string;
  patternLabel: string;
  note: string;
  /** What the learner must express, in English. */
  prompt: string;
  /** Every acceptable Spanish rendering. Grading is a lookup, not a judgement. */
  answers: string[];
  /** The form shown when revealing, always answers[0]. */
  canonical: string;
}

/** Deterministic PRNG so exercise sequences are reproducible in tests. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fill(template: string, picks: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, slot: string) => picks[slot] ?? `{${slot}}`);
}

/**
 * Build one exercise from a pattern.
 *
 * The acceptable answer set is the cartesian product over the chosen slot
 * options' Spanish variants. Keeping it enumerable is the whole point: the
 * grader never has to judge, so it can never mark a correct answer wrong.
 */
export function buildExercise(pattern: Pattern, seed: number): Exercise {
  const rand = mulberry32(seed);
  const slotNames = Object.keys(pattern.slots);

  const chosen: Record<string, SlotOption> = {};
  for (const name of slotNames) {
    const options = pattern.slots[name];
    chosen[name] = options[Math.floor(rand() * options.length)];
  }

  const enPicks: Record<string, string> = {};
  for (const name of slotNames) enPicks[name] = chosen[name].en;

  // Cartesian product across each slot's accepted Spanish variants.
  let answers: string[] = [pattern.template.es];
  for (const name of slotNames) {
    const next: string[] = [];
    for (const partial of answers) {
      for (const variant of chosen[name].es) {
        next.push(fill(partial, { [name]: variant }));
      }
    }
    answers = next;
  }

  return {
    id: `${pattern.id}:${seed}`,
    patternId: pattern.id,
    patternLabel: pattern.label,
    note: pattern.note,
    prompt: fill(pattern.template.en, enPicks),
    answers,
    canonical: answers[0],
  };
}

/**
 * A session: one exercise per pattern in curriculum order, then repeats with
 * fresh slot fillers. Ordering is by rank, so leverage comes first.
 */
export function buildSession(length: number, seed = Date.now()): Exercise[] {
  const ordered = [...PATTERNS].sort((a, b) => a.rank - b.rank);
  const out: Exercise[] = [];
  for (let i = 0; i < length; i++) {
    const pattern = ordered[i % ordered.length];
    out.push(buildExercise(pattern, seed + i * 7919));
  }
  return out;
}
