import type { Exercise } from "./generate";

/**
 * Deterministic grading.
 *
 * The model is never asked whether an answer is right. Being told you are
 * wrong when you are right is the fastest way to lose a learner, so
 * correctness is a lookup against the enumerable answer set and nothing else.
 * The model's job starts afterwards, explaining a verdict already reached.
 */

export type ErrorTag =
  | "empty"
  | "accent"
  | "word_order"
  | "missing_word"
  | "extra_word"
  | "wrong_word"
  | "english_intrusion";

export interface Grade {
  correct: boolean;
  /** Right answer, wrong surface: counts as correct but worth flagging. */
  nearMiss: boolean;
  errorTag?: ErrorTag;
  message: string;
  /** Shown on a miss. */
  expected: string;
}

/** Lowercase, drop punctuation, collapse whitespace. */
export function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/[¿?¡!.,;:"']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Strip the written accent but keep ñ.
 *
 * ñ is a distinct letter, not an accented n: año and ano are different words,
 * so folding it would let a real error pass as a typo.
 */
export function deaccent(input: string): string {
  return input
    .replace(/á/g, "a")
    .replace(/é/g, "e")
    .replace(/í/g, "i")
    .replace(/ó/g, "o")
    .replace(/ú/g, "u")
    .replace(/ü/g, "u");
}

const ENGLISH_FUNCTION_WORDS = new Set([
  "i", "to", "the", "do", "not", "am", "going", "have", "can", "want", "need", "you",
]);

function tokens(s: string): string[] {
  return s.split(" ").filter(Boolean);
}

function sameMultiset(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

/** Content words from the English prompt, used to catch untranslated tokens. */
function promptContentWords(prompt: string): Set<string> {
  return new Set(
    tokens(normalize(prompt)).filter((w) => !ENGLISH_FUNCTION_WORDS.has(w)),
  );
}

export function grade(exercise: Exercise, submitted: string): Grade {
  const expected = exercise.canonical;
  const sub = normalize(submitted);

  if (!sub) {
    return {
      correct: false,
      nearMiss: false,
      errorTag: "empty",
      message: "Have a go before revealing. Producing it wrong and being corrected beats reading the answer.",
      expected,
    };
  }

  const accepted = exercise.answers.map(normalize);

  // 1. Exact match against any accepted form.
  if (accepted.includes(sub)) {
    return { correct: true, nearMiss: false, message: "Correct.", expected };
  }

  // 2. Right words, missing or wrong accents.
  const subFolded = deaccent(sub);
  const acceptedFolded = accepted.map(deaccent);
  if (acceptedFolded.includes(subFolded)) {
    return {
      correct: true,
      nearMiss: true,
      errorTag: "accent",
      message: `Right, but watch the accent: ${expected}. In Spanish the written accent marks which syllable is stressed, so it changes how the word sounds.`,
      expected,
    };
  }

  const subTokens = tokens(subFolded);

  // 3. Every word right, order wrong. The classic L1 interference error.
  for (const candidate of acceptedFolded) {
    if (sameMultiset(subTokens, tokens(candidate))) {
      return {
        correct: false,
        nearMiss: false,
        errorTag: "word_order",
        message: `Every word is right, the order is not. Spanish wants ${expected}.`,
        expected,
      };
    }
  }

  // 4. An English word left in the sentence.
  const english = promptContentWords(exercise.prompt);
  const intruder = subTokens.find((w) => english.has(w));
  if (intruder) {
    return {
      correct: false,
      nearMiss: false,
      errorTag: "english_intrusion",
      message: `"${intruder}" is still English. That is the word to reach for next time; the rest of the frame was right.`,
      expected,
    };
  }

  // 5. Length tells us whether something is missing or spare.
  const best = acceptedFolded.reduce((a, b) =>
    Math.abs(tokens(b).length - subTokens.length) <
    Math.abs(tokens(a).length - subTokens.length)
      ? b
      : a,
  );
  const bestTokens = tokens(best);

  if (subTokens.length < bestTokens.length) {
    const missing = bestTokens.filter((w) => !subTokens.includes(w));
    return {
      correct: false,
      nearMiss: false,
      errorTag: "missing_word",
      message: missing.length
        ? `Something is missing: ${missing.join(", ")}. The full sentence is ${expected}.`
        : `Not quite. The full sentence is ${expected}.`,
      expected,
    };
  }

  if (subTokens.length > bestTokens.length) {
    const extra = subTokens.filter((w) => !bestTokens.includes(w));
    return {
      correct: false,
      nearMiss: false,
      errorTag: "extra_word",
      message: extra.length
        ? `Spanish does not need ${extra.join(", ")} here. It is just ${expected}.`
        : `Not quite. It is ${expected}.`,
      expected,
    };
  }

  return {
    correct: false,
    nearMiss: false,
    errorTag: "wrong_word",
    message: `Not quite. It is ${expected}.`,
    expected,
  };
}
