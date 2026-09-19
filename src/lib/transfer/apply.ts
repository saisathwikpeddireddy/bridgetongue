import { EN_ES_FALSE_FRIENDS, EN_ES_RULES } from "./rules";
import type { TransferResult, TransferRule } from "./types";

const VOWELS = "aeiouáéíóú";
const ACCENT: Record<string, string> = {
  a: "á",
  e: "é",
  i: "í",
  o: "ó",
  u: "ú",
};

/**
 * Spanish orthography English speakers reliably get wrong, applied after the
 * suffix substitution. These are not guesses; each is a systematic difference.
 */
function normalizeSpanishOrthography(word: string): string {
  return (
    word
      // Spanish has almost no doubled consonants (ll and rr are separate letters).
      .replace(/ss/g, "s")
      .replace(/mm/g, "m")
      .replace(/ff/g, "f")
      .replace(/tt/g, "t")
      .replace(/pp/g, "p")
      .replace(/cc(?![ei])/g, "c")
      // Greek-via-Latin spellings simplify.
      .replace(/ph/g, "f")
      .replace(/th/g, "t")
      .replace(/rh/g, "r")
      // Spanish uses y only as a word-final glide or the word "y"; the Greek
      // upsilon that English spells y is an i (sistema, analitico, misterio).
      .replace(/(?<=.)y(?=.)/g, "i")
      // No word-initial s + consonant; Spanish prothesizes an e.
      .replace(/^s([bcdfglmnpqrtv])/, "es$1")
  );
}

/**
 * Place the written accent on the antepenultimate vowel nucleus.
 *
 * Words in the -ico family are esdrújulas, which in Spanish *always* carry a
 * written accent. Rather than storing the accented form per word we derive it,
 * which is what makes the rule feel like a rule to the learner.
 */
function stressAntepenultimate(word: string): string {
  const nuclei: number[] = [];
  for (let i = 0; i < word.length; i++) {
    if (VOWELS.includes(word[i])) {
      // Treat a vowel run as one nucleus.
      if (i === 0 || !VOWELS.includes(word[i - 1])) nuclei.push(i);
    }
  }
  if (nuclei.length < 3) return word;
  // Already accented somewhere: leave it alone.
  if (/[áéíóú]/.test(word)) return word;

  const target = nuclei[nuclei.length - 3];
  const letter = word[target];
  const accented = ACCENT[letter];
  if (!accented) return word;
  return word.slice(0, target) + accented + word.slice(target + 1);
}

function findFalseFriend(spanish: string) {
  return EN_ES_FALSE_FRIENDS.find((f) => f.form === spanish);
}

/**
 * Convert a single English word to its Spanish cognate, if a rule covers it.
 *
 * Returns null when no rule matches. A null is an honest answer: this engine
 * is deliberately not a translator, and a learner who sees "no rule covers
 * this" learns something true about the boundary of the method.
 */
export function transfer(
  englishWord: string,
  rules: ReadonlyArray<TransferRule> = EN_ES_RULES,
): TransferResult | null {
  const input = englishWord.trim().toLowerCase();
  if (!input || !/^[a-z-]+$/.test(input)) return null;

  for (const rule of rules) {
    if (!rule.auto) continue;
    if (!rule.match.test(input)) continue;

    // Prefer the curated example when we have one: it is verified.
    const known = rule.examples.find(([en]) => en === input);
    let output = known
      ? known[1]
      : normalizeSpanishOrthography(input.replace(rule.match, rule.replace));

    if (!known && rule.stressAntepenult) {
      output = stressAntepenultimate(output);
    }

    const falseFriend = findFalseFriend(output);

    return {
      input,
      output,
      ruleId: rule.id,
      ruleLabel: rule.label,
      note: rule.note,
      caveat: known
        ? undefined
        : "Derived from the rule, not checked against a dictionary. The corpus pipeline will verify these.",
      falseFriend,
    };
  }

  return null;
}

/** Every rule that would fire for a word, for the teaching view. */
export function explain(
  englishWord: string,
  rules: ReadonlyArray<TransferRule> = EN_ES_RULES,
): TransferRule[] {
  const input = englishWord.trim().toLowerCase();
  return rules.filter((r) => r.match.test(input));
}

export { normalizeSpanishOrthography, stressAntepenultimate };
