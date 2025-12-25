import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated, authStorage } from "./replit_integrations/auth";
import { insertProfileSchema, insertScorecardSchema, profiles } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  app.get("/api/profile", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      const user = await authStorage.getUser(userId);
      res.json({ profile, user });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.patch("/api/profile", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = insertProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid profile data", errors: parsed.error.errors });
      }
      const profile = await storage.upsertProfile(userId, parsed.data);
      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.get("/api/profiles/:userId", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const profile = await storage.getProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      if (!profile.isPublic) {
        const currentUser = (req as any).user?.claims?.sub;
        if (currentUser !== userId) {
          return res.status(403).json({ message: "This profile is private" });
        }
      }
      const user = await authStorage.getUser(userId);
      const scorecards = profile.isPublic ? await storage.getScorecardsByUser(userId) : [];
      res.json({ profile, user, scorecards });
    } catch (error) {
      console.error("Error fetching public profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post("/api/scorecards", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = insertScorecardSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid scorecard data", errors: parsed.error.errors });
      }
      const scorecard = await storage.createScorecard(userId, parsed.data);
      res.json(scorecard);
    } catch (error) {
      console.error("Error saving scorecard:", error);
      res.status(500).json({ message: "Failed to save scorecard" });
    }
  });

  app.get("/api/scorecards", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const scorecards = await storage.getScorecardsByUser(userId);
      res.json(scorecards);
    } catch (error) {
      console.error("Error fetching scorecards:", error);
      res.status(500).json({ message: "Failed to fetch scorecards" });
    }
  });

  app.get("/api/scorecards/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const scorecard = await storage.getScorecard(id);
      if (!scorecard) {
        return res.status(404).json({ message: "Scorecard not found" });
      }
      const profile = await storage.getProfile(scorecard.userId);
      const currentUser = (req as any).user?.claims?.sub;
      if (!profile?.isPublic && currentUser !== scorecard.userId) {
        return res.status(403).json({ message: "This scorecard is private" });
      }
      res.json(scorecard);
    } catch (error) {
      console.error("Error fetching scorecard:", error);
      res.status(500).json({ message: "Failed to fetch scorecard" });
    }
  });

  app.delete("/api/scorecards/:id", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const scorecard = await storage.getScorecard(id);
      if (!scorecard) {
        return res.status(404).json({ message: "Scorecard not found" });
      }
      if (scorecard.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this scorecard" });
      }
      await storage.deleteScorecard(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting scorecard:", error);
      res.status(500).json({ message: "Failed to delete scorecard" });
    }
  });

  return httpServer;
}
