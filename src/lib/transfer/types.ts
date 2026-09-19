/**
 * The transfer graph.
 *
 * The product thesis is that an adult learner does not start from zero. An
 * English speaker approaching Spanish already owns most of the Latinate
 * lexicon; what they lack is the *mapping function*. So the unit of curriculum
 * here is not a word, it is a rule that converts words the learner already has.
 *
 * Everything in this module is language-pair agnostic in shape. `rules.ts`
 * holds the en->es instance. Additional pairs are additional data, not
 * additional code.
 */

/** A deterministic orthographic mapping from an L1 form to an L2 form. */
export interface TransferRule {
  id: string;
  /** Display form, e.g. "-tion  ->  -ción". */
  label: string;
  /** One sentence a learner reads once and then owns forever. */
  note: string;
  /** Suffix (or whole-form) pattern matched against the lowercased L1 word. */
  match: RegExp;
  /** Replacement applied to the match. */
  replace: string;
  /** Canonical [L1, L2] pairs, used in teaching and in tests. */
  examples: ReadonlyArray<readonly [string, string]>;
  /**
   * Whether the live converter may apply this rule unattended. Rules that need
   * morphology we have not built yet (e.g. -ly -> -mente needs the feminine
   * adjective first) are taught but not auto-applied.
   */
  auto: boolean;
  /** Apply Spanish antepenultimate stress after substitution (the -ico family). */
  stressAntepenult?: boolean;
  /**
   * Frequency-weighted yield.
   *
   * NOTE: these are hand-seeded order-of-magnitude estimates so the UI has
   * something to render. They are placeholders. The real numbers come from the
   * corpus pipeline (Wiktionary + OpenSubtitles frequency lists); see
   * docs/ARCHITECTURE.md. Do not quote them publicly until that lands.
   */
  estWords: number;
  /** Forms where the mapping produces a real word with the wrong meaning. */
  falseFriends?: ReadonlyArray<{
    form: string;
    looksLike: string;
    actuallyMeans: string;
  }>;
}

export interface TransferResult {
  input: string;
  output: string;
  ruleId: string;
  ruleLabel: string;
  note: string;
  /** Set when the mapping is plausible but unverified against a lexicon. */
  caveat?: string;
  falseFriend?: {
    form: string;
    looksLike: string;
    actuallyMeans: string;
  };
}

export interface LanguagePair {
  id: string;
  l1: string;
  l2: string;
  rules: ReadonlyArray<TransferRule>;
}
