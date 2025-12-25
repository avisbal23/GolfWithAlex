import { profiles, scorecards, type Profile, type InsertProfile, type Scorecard, type InsertScorecard } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getProfile(userId: string): Promise<Profile | undefined>;
  upsertProfile(userId: string, data: InsertProfile): Promise<Profile>;
  
  createScorecard(userId: string, data: InsertScorecard): Promise<Scorecard>;
  getScorecard(id: string): Promise<Scorecard | undefined>;
  getScorecardsByUser(userId: string): Promise<Scorecard[]>;
  deleteScorecard(id: string, userId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  }

  async upsertProfile(userId: string, data: InsertProfile): Promise<Profile> {
    const [profile] = await db
      .insert(profiles)
      .values({ ...data, userId })
      .onConflictDoUpdate({
        target: profiles.userId,
        set: {
          ...data,
          updatedAt: new Date(),
        },
      })
      .returning();
    return profile;
  }

  async createScorecard(userId: string, data: InsertScorecard): Promise<Scorecard> {
    const [scorecard] = await db
      .insert(scorecards)
      .values({ ...data, userId })
      .returning();
    return scorecard;
  }

  async getScorecard(id: string): Promise<Scorecard | undefined> {
    const [scorecard] = await db.select().from(scorecards).where(eq(scorecards.id, id));
    return scorecard;
  }

  async getScorecardsByUser(userId: string): Promise<Scorecard[]> {
    return await db
      .select()
      .from(scorecards)
      .where(eq(scorecards.userId, userId))
      .orderBy(desc(scorecards.createdAt));
  }

  async deleteScorecard(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(scorecards)
      .where(eq(scorecards.id, id));
    return true;
  }
}

export const storage = new DatabaseStorage();
