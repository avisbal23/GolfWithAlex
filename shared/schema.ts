import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

import { users } from "./models/auth";

export const profiles = pgTable("profiles", {
  userId: varchar("user_id").primaryKey().references(() => users.id),
  displayName: varchar("display_name"),
  aboutMe: text("about_me"),
  location: varchar("location"),
  favoriteCourse: varchar("favorite_course"),
  favoriteClub: varchar("favorite_club"),
  age: integer("age"),
  isPublic: boolean("is_public").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const scorecards = pgTable("scorecards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  courseName: varchar("course_name"),
  tees: varchar("tees"),
  location: varchar("location"),
  date: varchar("date"),
  holeCount: integer("hole_count").notNull(),
  players: jsonb("players").notNull(),
  scores: jsonb("scores").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

export const scorecardsRelations = relations(scorecards, ({ one }) => ({
  user: one(users, {
    fields: [scorecards.userId],
    references: [users.id],
  }),
}));

export const insertProfileSchema = createInsertSchema(profiles).omit({
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertScorecardSchema = createInsertSchema(scorecards).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

export type InsertScorecard = z.infer<typeof insertScorecardSchema>;
export type Scorecard = typeof scorecards.$inferSelect;
