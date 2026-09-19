import { describe, expect, test } from "vitest";

import { PATTERNS, patternById } from "@/lib/curriculum/patterns";
import { buildExercise, buildSession } from "./generate";
import { deaccent, grade, normalize } from "./grade";

const ex = (patternId: string, seed = 1) =>
  buildExercise(patternById(patternId)!, seed);

describe("exercise generation", () => {
  test("fills every slot in both languages", () => {
    for (const pattern of PATTERNS) {
      for (let seed = 0; seed < 20; seed++) {
        const e = buildExercise(pattern, seed);
        expect(e.prompt, `${pattern.id} en`).not.toMatch(/[{}]/);
        for (const a of e.answers) {
          expect(a, `${pattern.id} es`).not.toMatch(/[{}]/);
        }
        expect(e.answers.length).toBeGreaterThan(0);
        expect(e.canonical).toBe(e.answers[0]);
      }
    }
  });

  test("is deterministic for a given seed", () => {
    expect(buildExercise(PATTERNS[0], 42)).toEqual(buildExercise(PATTERNS[0], 42));
  });

  test("a session covers patterns in curriculum order", () => {
    const session = buildSession(PATTERNS.length, 5);
    const ranks = session.map((e) => patternById(e.patternId)!.rank);
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  });

  test("accepts declared synonyms", () => {
    // "drink" accepts both beber and tomar; find a seed that picks it.
    const seeds = Array.from({ length: 60 }, (_, i) => i);
    const withSynonym = seeds
      .map((s) => ex("querer-inf", s))
      .find((e) => e.answers.length > 1);
    expect(withSynonym).toBeDefined();
    for (const a of withSynonym!.answers) {
      expect(grade(withSynonym!, a).correct).toBe(true);
    }
  });
});

describe("normalization", () => {
  test("strips punctuation and case", () => {
    expect(normalize("  ¿Quieres  comer? ")).toBe("quieres comer");
  });

  test("folds accents but never ñ", () => {
    expect(deaccent("información")).toBe("informacion");
    expect(deaccent("año")).toBe("año");
  });
});

describe("grading", () => {
  test("accepts the canonical answer", () => {
    for (const pattern of PATTERNS) {
      const e = buildExercise(pattern, 3);
      const g = grade(e, e.canonical);
      expect(g.correct, `${pattern.id}: ${e.canonical}`).toBe(true);
      expect(g.nearMiss).toBe(false);
    }
  });

  test("is insensitive to case, spacing and punctuation", () => {
    const e = ex("querer-inf", 0);
    expect(grade(e, `  ${e.canonical.toUpperCase()}!  `).correct).toBe(true);
  });

  test("counts a missing accent as correct but flags it", () => {
    const e = ex("necesitar-noun", 0);
    const stripped = deaccent(e.canonical);
    if (stripped === e.canonical) return; // seed picked an unaccented noun
    const g = grade(e, stripped);
    expect(g.correct).toBe(true);
    expect(g.nearMiss).toBe(true);
    expect(g.errorTag).toBe("accent");
  });

  test("never folds ñ into n when grading", () => {
    const e = ex("querer-inf", 0);
    expect(grade(e, "quiero año").correct).toBe(false);
  });

  test("detects word order with all the right words", () => {
    const e = ex("tener-que-inf", 0);
    const reversed = e.canonical.split(" ").reverse().join(" ");
    const g = grade(e, reversed);
    expect(g.correct).toBe(false);
    expect(g.errorTag).toBe("word_order");
  });

  test("detects an untranslated English word", () => {
    const e = ex("querer-inf", 0);
    const englishVerb = e.prompt.replace("I want to ", "");
    const g = grade(e, `quiero ${englishVerb}`);
    expect(g.correct).toBe(false);
    expect(g.errorTag).toBe("english_intrusion");
    expect(g.message).toContain(englishVerb);
  });

  test("detects a missing word", () => {
    const e = ex("tener-que-inf", 0);
    const dropped = e.canonical.split(" ").slice(1).join(" ");
    const g = grade(e, dropped);
    expect(g.correct).toBe(false);
    expect(g.errorTag).toBe("missing_word");
  });

  test("detects a spare word", () => {
    const e = ex("querer-inf", 0);
    const g = grade(e, `${e.canonical} mucho`);
    expect(g.correct).toBe(false);
    expect(g.errorTag).toBe("extra_word");
  });

  test("treats an empty submission as unattempted, not wrong", () => {
    const e = ex("querer-inf", 0);
    const g = grade(e, "   ");
    expect(g.correct).toBe(false);
    expect(g.errorTag).toBe("empty");
  });

  test("never marks an accepted answer wrong, across the whole course", () => {
    for (const pattern of PATTERNS) {
      for (let seed = 0; seed < 40; seed++) {
        const e = buildExercise(pattern, seed);
        for (const answer of e.answers) {
          expect(grade(e, answer).correct, `${pattern.id}/${seed}: ${answer}`).toBe(true);
        }
      }
    }
  });
});
