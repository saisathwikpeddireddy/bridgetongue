import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * A concept is a node in the transfer graph: either a mapping rule
 * ("-tion becomes -ción") or a structure ("querer + infinitive").
 */
export const conceptKind = pgEnum("concept_kind", [
  "transfer_rule",
  "structure",
  "lexeme",
  "false_friend",
  "phonology",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  /** The language the learner is transferring FROM. The whole product hinges
   *  on knowing this, which is precisely what generic courses do not model. */
  l1: text("l1").notNull().default("en"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (t) => [uniqueIndex("users_email_idx").on(t.email)]);

export const concepts = pgTable("concepts", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Stable human-readable key, e.g. "en-es:tion-cion". */
  slug: text("slug").notNull(),
  pairId: text("pair_id").notNull(),
  kind: conceptKind("kind").notNull(),
  label: text("label").notNull(),
  note: text("note").notNull(),
  /**
   * Curriculum ordering. Lower comes first. Derived from expressive yield per
   * unit of learning cost, not hand-authored; see docs/ARCHITECTURE.md.
   */
  rank: integer("rank").notNull().default(0),
  estWords: integer("est_words").notNull().default(0),
  /** Concept slugs that must be mastered first. */
  prerequisites: jsonb("prerequisites").$type<string[]>().notNull().default([]),
  payload: jsonb("payload").$type<Record<string, unknown>>(),
}, (t) => [
  uniqueIndex("concepts_slug_idx").on(t.slug),
  index("concepts_pair_rank_idx").on(t.pairId, t.rank),
]);

/**
 * Per-learner state for one concept. `strength` drives scheduling; `medianLatencyMs`
 * is the fluency signal that separates "knows it" from "can say it".
 */
export const mastery = pgTable("mastery", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  conceptId: uuid("concept_id")
    .notNull()
    .references(() => concepts.id, { onDelete: "cascade" }),
  strength: real("strength").notNull().default(0),
  medianLatencyMs: integer("median_latency_ms"),
  attempts: integer("attempts").notNull().default(0),
  correct: integer("correct").notNull().default(0),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
  dueAt: timestamp("due_at", { withTimezone: true }),
}, (t) => [
  uniqueIndex("mastery_user_concept_idx").on(t.userId, t.conceptId),
  index("mastery_due_idx").on(t.userId, t.dueAt),
]);

/**
 * Append-only attempt log. This is the research asset: it is the record of
 * which L1 speakers make which errors on which concepts, which is exactly what
 * lets the curriculum predict errors before they happen.
 */
export const attempts = pgTable("attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  conceptId: uuid("concept_id")
    .notNull()
    .references(() => concepts.id, { onDelete: "cascade" }),
  /** What the learner was asked to express, in L1. */
  prompt: text("prompt").notNull(),
  expected: text("expected").notNull(),
  submitted: text("submitted").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  /** Time from prompt render to submit. The fluency metric. */
  latencyMs: integer("latency_ms"),
  /** Classified error type, e.g. "gender_agreement", "l1_word_order". */
  errorTag: text("error_tag"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (t) => [
  index("attempts_user_created_idx").on(t.userId, t.createdAt),
  index("attempts_concept_idx").on(t.conceptId),
]);

export type User = typeof users.$inferSelect;
export type Concept = typeof concepts.$inferSelect;
export type Mastery = typeof mastery.$inferSelect;
export type Attempt = typeof attempts.$inferSelect;
