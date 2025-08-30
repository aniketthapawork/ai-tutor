import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  integer,
  text,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  currentLevel: varchar("current_level").default("beginner"),
  totalPoints: integer("total_points").default(0),
  currentStreak: integer("current_streak").default(0),
  lastActivityDate: timestamp("last_activity_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const modules = pgTable("modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  level: varchar("level").notNull(), // 'beginner', 'intermediate', 'advanced'
  content: text("content").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tests = pgTable("tests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  type: varchar("type").notNull(), // 'comprehension', 'essay', 'letter'
  content: jsonb("content").notNull(), // Questions, passages, etc.
  maxScore: integer("max_score").default(10),
  timeLimit: integer("time_limit_minutes").default(30),
  level: varchar("level").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userModuleProgress = pgTable("user_module_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  moduleId: varchar("module_id").notNull().references(() => modules.id),
  completed: boolean("completed").default(false),
  score: decimal("score", { precision: 3, scale: 1 }),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const testAttempts = pgTable("test_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  testId: varchar("test_id").notNull().references(() => tests.id),
  answers: jsonb("answers").notNull(),
  score: decimal("score", { precision: 3, scale: 1 }).notNull(),
  timeSpent: integer("time_spent_minutes"),
  completedAt: timestamp("completed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiFeedback = pgTable("ai_feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  testAttemptId: varchar("test_attempt_id").notNull().references(() => testAttempts.id),
  overallScore: decimal("overall_score", { precision: 3, scale: 1 }).notNull(),
  grammarScore: decimal("grammar_score", { precision: 3, scale: 1 }).notNull(),
  vocabularyScore: decimal("vocabulary_score", { precision: 3, scale: 1 }).notNull(),
  structureScore: decimal("structure_score", { precision: 3, scale: 1 }).notNull(),
  strengths: text("strengths"),
  improvements: text("improvements"),
  suggestions: text("suggestions"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const streakHistory = pgTable("streak_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  activitiesCompleted: integer("activities_completed").default(0),
  pointsEarned: integer("points_earned").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // 'streak', 'score', 'completion'
  title: varchar("title").notNull(),
  description: text("description"),
  earnedAt: timestamp("earned_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  moduleProgress: many(userModuleProgress),
  testAttempts: many(testAttempts),
  streakHistory: many(streakHistory),
  achievements: many(achievements),
}));

export const modulesRelations = relations(modules, ({ many }) => ({
  userProgress: many(userModuleProgress),
}));

export const testsRelations = relations(tests, ({ many }) => ({
  attempts: many(testAttempts),
}));

export const testAttemptsRelations = relations(testAttempts, ({ one, many }) => ({
  user: one(users, {
    fields: [testAttempts.userId],
    references: [users.id],
  }),
  test: one(tests, {
    fields: [testAttempts.testId],
    references: [tests.id],
  }),
  feedback: many(aiFeedback),
}));

export const aiFeedbackRelations = relations(aiFeedback, ({ one }) => ({
  testAttempt: one(testAttempts, {
    fields: [aiFeedback.testAttemptId],
    references: [testAttempts.id],
  }),
}));

// Schema types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type Module = typeof modules.$inferSelect;
export type InsertModule = typeof modules.$inferInsert;

export type Test = typeof tests.$inferSelect;
export type InsertTest = typeof tests.$inferInsert;

export type UserModuleProgress = typeof userModuleProgress.$inferSelect;
export type InsertUserModuleProgress = typeof userModuleProgress.$inferInsert;

export type TestAttempt = typeof testAttempts.$inferSelect;
export type InsertTestAttempt = typeof testAttempts.$inferInsert;

export type AIFeedback = typeof aiFeedback.$inferSelect;
export type InsertAIFeedback = typeof aiFeedback.$inferInsert;

export type StreakHistory = typeof streakHistory.$inferSelect;
export type InsertStreakHistory = typeof streakHistory.$inferInsert;

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

// Insert schemas for validation
export const insertModuleSchema = createInsertSchema(modules).omit({ id: true, createdAt: true });
export const insertTestSchema = createInsertSchema(tests).omit({ id: true, createdAt: true });
export const insertTestAttemptSchema = createInsertSchema(testAttempts).omit({ id: true, createdAt: true, completedAt: true });
export const insertAIFeedbackSchema = createInsertSchema(aiFeedback).omit({ id: true, createdAt: true });
export const insertStreakHistorySchema = createInsertSchema(streakHistory).omit({ id: true, createdAt: true });
export const insertAchievementSchema = createInsertSchema(achievements).omit({ id: true, earnedAt: true });
