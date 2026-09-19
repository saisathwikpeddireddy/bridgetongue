/**
 * The mini-course.
 *
 * Each pattern is a structure with slots, chosen for expressive leverage: one
 * memorized verb form buys an unbounded number of sentences, because the slot
 * is filled from vocabulary the learner already owns (often via a transfer
 * rule). This is the opposite of teaching conjugation tables up front.
 *
 * Patterns are data. Adding to the course is adding entries here, and the
 * corpus pipeline will eventually generate them rather than us writing them.
 */

export interface SlotOption {
  en: string;
  /** Primary Spanish form first; later entries are also accepted. */
  es: string[];
}

export interface Pattern {
  id: string;
  label: string;
  /** The one-sentence insight the learner keeps. */
  note: string;
  /** Curriculum order: expressive yield per unit of learning cost. */
  rank: number;
  prerequisites: string[];
  /** `{slot}` placeholders resolved against `slots`. */
  template: { en: string; es: string };
  slots: Record<string, SlotOption[]>;
}

const VERBS: SlotOption[] = [
  { en: "eat", es: ["comer"] },
  { en: "speak", es: ["hablar"] },
  { en: "work", es: ["trabajar"] },
  { en: "travel", es: ["viajar"] },
  { en: "study", es: ["estudiar"] },
  { en: "learn", es: ["aprender"] },
  { en: "drink", es: ["beber", "tomar"] },
  { en: "read", es: ["leer"] },
];

const LATINATE_NOUNS: SlotOption[] = [
  { en: "the information", es: ["la información"] },
  { en: "the situation", es: ["la situación"] },
  { en: "the university", es: ["la universidad"] },
  { en: "the possibility", es: ["la posibilidad"] },
  { en: "the decision", es: ["la decisión"] },
  { en: "the opportunity", es: ["la oportunidad"] },
];

export const PATTERNS: Pattern[] = [
  {
    id: "querer-inf",
    label: "querer + infinitive",
    note: "One conjugated form, quiero, plus any infinitive. You are not learning a tense, you are learning a hinge: everything after it stays in the dictionary form.",
    rank: 1,
    prerequisites: [],
    template: { en: "I want to {verb}", es: "quiero {verb}" },
    slots: { verb: VERBS },
  },
  {
    id: "querer-inf-neg",
    label: "Negation: no + verb",
    note: "Spanish negates by putting no directly before the verb. There is no equivalent of English do-support, so I do not want collapses to no quiero.",
    rank: 2,
    prerequisites: ["querer-inf"],
    template: { en: "I do not want to {verb}", es: "no quiero {verb}" },
    slots: { verb: VERBS },
  },
  {
    id: "poder-inf",
    label: "poder + infinitive",
    note: "Same hinge, different verb. Puedo means I can, and again the next verb stays in the infinitive.",
    rank: 3,
    prerequisites: ["querer-inf"],
    template: { en: "I can {verb}", es: "puedo {verb}" },
    slots: { verb: VERBS },
  },
  {
    id: "tener-que-inf",
    label: "tener que + infinitive",
    note: "Obligation is tener que, literally to have that. Tengo que trabajar is I have to work.",
    rank: 4,
    prerequisites: ["querer-inf"],
    template: { en: "I have to {verb}", es: "tengo que {verb}" },
    slots: { verb: VERBS },
  },
  {
    id: "ir-a-inf",
    label: "ir a + infinitive",
    note: "The future, for free. Voy a plus an infinitive is going to, exactly as in English, and it saves you an entire tense.",
    rank: 5,
    prerequisites: ["querer-inf"],
    template: { en: "I am going to {verb}", es: "voy a {verb}" },
    slots: { verb: VERBS },
  },
  {
    id: "necesitar-noun",
    label: "Transfer rules in a sentence",
    note: "Now the transfer rules pay off inside real sentences. Every noun here is one you already owned in English.",
    rank: 6,
    prerequisites: ["querer-inf"],
    template: { en: "I need {noun}", es: "necesito {noun}" },
    slots: { noun: LATINATE_NOUNS },
  },
  {
    id: "querer-question",
    label: "Questions by intonation",
    note: "No word order change and no auxiliary. Quieres comer? is both you want to eat and do you want to eat. Spanish opens the question with an inverted mark.",
    rank: 7,
    prerequisites: ["querer-inf"],
    template: { en: "Do you want to {verb}?", es: "¿quieres {verb}?" },
    slots: { verb: VERBS },
  },
];

export function patternById(id: string): Pattern | undefined {
  return PATTERNS.find((p) => p.id === id);
}
