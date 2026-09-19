import type { LanguagePair, TransferRule } from "./types";

/**
 * English -> Spanish transfer rules, ordered by expressive yield.
 *
 * Ordering matters twice over: it is the order the converter tries patterns in
 * (most specific suffix first), and it is the order the curriculum teaches them
 * in. Those happen to coincide for this pair.
 */
const RULES: TransferRule[] = [
  {
    id: "tion-cion",
    label: "-tion  →  -ción",
    note: "Every English -tion noun is a Spanish -ción noun, and it is feminine. This single rule is the largest one-step vocabulary gain available to an English speaker in any language.",
    match: /tion$/,
    replace: "ción",
    examples: [
      ["nation", "nación"],
      ["information", "información"],
      ["constitution", "constitución"],
      ["operation", "operación"],
    ],
    auto: true,
    estWords: 2400,
  },
  {
    id: "sion-sion",
    label: "-sion  →  -sión",
    note: "The same move as -tion, with an s. Also feminine.",
    match: /sion$/,
    replace: "sión",
    examples: [
      ["television", "televisión"],
      ["decision", "decisión"],
      ["expression", "expresión"],
    ],
    auto: true,
    estWords: 600,
  },
  {
    id: "ty-dad",
    label: "-ty  →  -dad",
    note: "Abstract nouns in -ty become -dad. Feminine. This is where most of English's academic vocabulary lives.",
    match: /ty$/,
    replace: "dad",
    examples: [
      ["university", "universidad"],
      ["reality", "realidad"],
      ["possibility", "posibilidad"],
      ["community", "comunidad"],
    ],
    auto: true,
    estWords: 900,
  },
  {
    id: "ble-ble",
    label: "-ble  →  -ble",
    note: "Unchanged. You already speak this suffix. Watch the spelling: Spanish does not double consonants, so possible loses an s.",
    match: /ble$/,
    replace: "ble",
    examples: [
      ["possible", "posible"],
      ["terrible", "terrible"],
      ["responsible", "responsable"],
    ],
    auto: true,
    estWords: 700,
  },
  {
    id: "al-al",
    label: "-al  →  -al",
    note: "Unchanged, and it works as both adjective and noun. Free vocabulary.",
    match: /al$/,
    replace: "al",
    examples: [
      ["natural", "natural"],
      ["social", "social"],
      ["personal", "personal"],
      ["general", "general"],
    ],
    auto: true,
    estWords: 1100,
  },
  {
    id: "ous-oso",
    label: "-ous  →  -oso",
    note: "Adjectives in -ous become -oso, and since it is an adjective it agrees: -oso / -osa / -osos / -osas.",
    match: /ous$/,
    replace: "oso",
    examples: [
      ["famous", "famoso"],
      ["delicious", "delicioso"],
      ["generous", "generoso"],
    ],
    auto: true,
    estWords: 500,
  },
  {
    id: "ic-ico",
    label: "-ic  →  -ico",
    note: "Add -o. The stress lands three syllables from the end, which is why these always carry a written accent.",
    match: /ic$/,
    replace: "ico",
    examples: [
      ["fantastic", "fantástico"],
      ["public", "público"],
      ["romantic", "romántico"],
      ["electric", "eléctrico"],
    ],
    auto: true,
    stressAntepenult: true,
    estWords: 800,
  },
  {
    id: "ist-ista",
    label: "-ist  →  -ista",
    note: "Add -a. Unusually, the form does not change for gender: el artista, la artista.",
    match: /ist$/,
    replace: "ista",
    examples: [
      ["artist", "artista"],
      ["tourist", "turista"],
      ["specialist", "especialista"],
    ],
    auto: true,
    estWords: 400,
  },
  {
    id: "ism-ismo",
    label: "-ism  →  -ismo",
    note: "Add -o. Masculine.",
    match: /ism$/,
    replace: "ismo",
    examples: [
      ["capitalism", "capitalismo"],
      ["tourism", "turismo"],
      ["optimism", "optimismo"],
    ],
    auto: true,
    estWords: 350,
  },
  {
    id: "ance-ancia",
    label: "-ance  →  -ancia",
    note: "Add -ia. Feminine.",
    match: /ance$/,
    replace: "ancia",
    examples: [
      ["importance", "importancia"],
      ["distance", "distancia"],
      ["elegance", "elegancia"],
    ],
    auto: true,
    estWords: 200,
  },
  {
    id: "ence-encia",
    label: "-ence  →  -encia",
    note: "Add -ia. Feminine. Same move as -ance.",
    match: /ence$/,
    replace: "encia",
    examples: [
      ["experience", "experiencia"],
      ["difference", "diferencia"],
      ["independence", "independencia"],
    ],
    auto: true,
    estWords: 300,
  },
  {
    id: "ct-cto",
    label: "-ct  →  -cto",
    note: "Add -o.",
    match: /ct$/,
    replace: "cto",
    examples: [
      ["perfect", "perfecto"],
      ["contact", "contacto"],
      ["product", "producto"],
    ],
    auto: true,
    estWords: 250,
  },
  {
    id: "ary-ario",
    label: "-ary  →  -ario",
    note: "Becomes -ario.",
    match: /ary$/,
    replace: "ario",
    examples: [
      ["necessary", "necesario"],
      ["ordinary", "ordinario"],
      ["contrary", "contrario"],
    ],
    auto: true,
    estWords: 300,
  },
  {
    id: "or-or",
    label: "-or  →  -or",
    note: "Unchanged. Mostly agent nouns, and they are masculine (the feminine adds -a: doctor / doctora).",
    match: /or$/,
    replace: "or",
    examples: [
      ["doctor", "doctor"],
      ["color", "color"],
      ["error", "error"],
      ["professor", "profesor"],
    ],
    auto: true,
    estWords: 600,
  },
  {
    id: "ly-mente",
    label: "-ly  →  -mente",
    note: "Adverbs swap -ly for -mente, but it attaches to the FEMININE adjective: rápido becomes rápidamente. Taught before it is automated, because it needs the adjective first.",
    match: /ly$/,
    replace: "mente",
    examples: [
      ["rapidly", "rápidamente"],
      ["exactly", "exactamente"],
      ["perfectly", "perfectamente"],
    ],
    // Needs adjective derivation we have not built; taught, not auto-applied.
    auto: false,
    estWords: 400,
  },
];

/**
 * Words the rules map onto a real Spanish word with a different meaning.
 * These are the highest-value things to teach, because the learner will
 * otherwise produce them confidently and be wrong.
 */
const FALSE_FRIENDS = [
  {
    form: "embarazada",
    looksLike: "embarrassed",
    actuallyMeans: "pregnant",
  },
  {
    form: "actualmente",
    looksLike: "actually",
    actuallyMeans: "currently",
  },
  {
    form: "realizar",
    looksLike: "to realize (understand)",
    actuallyMeans: "to carry out, to make happen",
  },
  {
    form: "asistir",
    looksLike: "to assist",
    actuallyMeans: "to attend",
  },
  {
    form: "sensible",
    looksLike: "sensible",
    actuallyMeans: "sensitive",
  },
  {
    form: "constipado",
    looksLike: "constipated",
    actuallyMeans: "having a head cold",
  },
] as const;

export const EN_ES: LanguagePair = {
  id: "en-es",
  l1: "English",
  l2: "Spanish",
  rules: RULES,
};

export { RULES as EN_ES_RULES, FALSE_FRIENDS as EN_ES_FALSE_FRIENDS };

/** Total estimated words unlocked by the auto-applicable rules. */
export const EN_ES_ESTIMATED_UNLOCK = RULES.reduce(
  (sum, r) => sum + r.estWords,
  0,
);
