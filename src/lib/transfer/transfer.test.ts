import { describe, expect, test } from "vitest";

import { transfer } from "./apply";
import { EN_ES_RULES } from "./rules";
import { lemmasForNextPoint, tokenCoverage } from "./coverage";

describe("transfer engine", () => {
  test("every curated example round-trips through its own rule", () => {
    for (const rule of EN_ES_RULES) {
      if (!rule.auto) continue;
      for (const [en, es] of rule.examples) {
        expect(transfer(en)?.output, `${en} via ${rule.id}`).toBe(es);
      }
    }
  });

  test("derives words it has never seen", () => {
    expect(transfer("celebration")?.output).toBe("celebración");
    expect(transfer("activity")?.output).toBe("actividad");
    expect(transfer("mysterious")?.output).toBe("misterioso");
  });

  test("collapses doubled consonants", () => {
    expect(transfer("profession")?.output).toBe("profesión");
    expect(transfer("commission")?.output).toBe("comisión");
  });

  test("places antepenultimate stress on the -ico family", () => {
    expect(transfer("democratic")?.output).toBe("democrático");
    expect(transfer("magnetic")?.output).toBe("magnético");
  });

  test("flags false friends", () => {
    expect(transfer("sensible")?.falseFriend?.actuallyMeans).toBe("sensitive");
  });

  test("returns null when no rule covers the word", () => {
    expect(transfer("dog")).toBeNull();
    expect(transfer("through")).toBeNull();
  });

  test("does not auto-apply rules marked manual", () => {
    // -ly needs the feminine adjective first, so it must not fire unattended.
    expect(transfer("quickly")).toBeNull();
  });

  test("rejects non-words", () => {
    expect(transfer("")).toBeNull();
    expect(transfer("a b c")).toBeNull();
  });
});

describe("coverage model", () => {
  test("is monotone and bounded", () => {
    expect(tokenCoverage(0)).toBe(0);
    expect(tokenCoverage(1000)).toBeGreaterThan(tokenCoverage(500));
    expect(tokenCoverage(50_000)).toBeLessThanOrEqual(1);
  });

  test("reports a positive cost for the next point of coverage", () => {
    expect(lemmasForNextPoint(1000)).toBeGreaterThan(0);
  });
});
