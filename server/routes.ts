import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateFeedback, generateTestQuestions } from "./services/aiService";
import { insertTestAttemptSchema, insertAIFeedbackSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard data endpoint
  app.get('/api/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const [user, stats, recentAttempts, leaderboard, achievements] = await Promise.all([
        storage.getUser(userId),
        storage.getUserStats(userId),
        storage.getUserTestAttempts(userId),
        storage.getLeaderboard(10),
        storage.getUserAchievements(userId),
      ]);

      const recentAttemptsWithFeedback = await Promise.all(
        recentAttempts.slice(0, 5).map(async (attempt) => {
          const feedback = await storage.getAIFeedbackByAttempt(attempt.id);
          const test = await storage.getTest(attempt.testId);
          return { attempt, feedback, test };
        })
      );

      res.json({
        user,
        stats,
        recentAttempts: recentAttemptsWithFeedback,
        leaderboard,
        achievements: achievements.slice(0, 3),
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Modules endpoints
  app.get('/api/modules', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const [modules, progress] = await Promise.all([
        storage.getAllModules(),
        storage.getUserModuleProgress(userId),
      ]);

      const modulesWithProgress = modules.map(module => {
        const userProgress = progress.find(p => p.moduleId === module.id);
        return {
          ...module,
          completed: userProgress?.completed || false,
          score: userProgress?.score || null,
        };
      });

      res.json(modulesWithProgress);
    } catch (error) {
      console.error("Error fetching modules:", error);
      res.status(500).json({ message: "Failed to fetch modules" });
    }
  });

  app.get('/api/modules/:level', isAuthenticated, async (req: any, res) => {
    try {
      const { level } = req.params;
      const userId = req.user.claims.sub;
      
      const [modules, progress] = await Promise.all([
        storage.getModulesByLevel(level),
        storage.getUserModuleProgress(userId),
      ]);

      const modulesWithProgress = modules.map(module => {
        const userProgress = progress.find(p => p.moduleId === module.id);
        return {
          ...module,
          completed: userProgress?.completed || false,
          score: userProgress?.score || null,
        };
      });

      res.json(modulesWithProgress);
    } catch (error) {
      console.error("Error fetching modules by level:", error);
      res.status(500).json({ message: "Failed to fetch modules" });
    }
  });

  // Tests endpoints
  app.get('/api/tests', isAuthenticated, async (req, res) => {
    try {
      const tests = await storage.getAllTests();
      res.json(tests);
    } catch (error) {
      console.error("Error fetching tests:", error);
      res.status(500).json({ message: "Failed to fetch tests" });
    }
  });

  app.get('/api/tests/type/:type', isAuthenticated, async (req, res) => {
    try {
      const { type } = req.params;
      const tests = await storage.getTestsByType(type);
      res.json(tests);
    } catch (error) {
      console.error("Error fetching tests by type:", error);
      res.status(500).json({ message: "Failed to fetch tests" });
    }
  });

  app.get('/api/tests/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const test = await storage.getTest(id);
      if (!test) {
        return res.status(404).json({ message: "Test not found" });
      }
      res.json(test);
    } catch (error) {
      console.error("Error fetching test:", error);
      res.status(500).json({ message: "Failed to fetch test" });
    }
  });

  // Generate dynamic test
  app.post('/api/tests/generate', isAuthenticated, async (req, res) => {
    try {
      const { type, level, count } = req.body;
      const testContent = await generateTestQuestions(type, level, count);
      
      // Store the generated test
      const test = await storage.createTest({
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Test - ${level}`,
        type,
        content: testContent,
        level,
        timeLimit: type === 'essay' ? 30 : type === 'letter' ? 20 : 15,
      });

      res.json(test);
    } catch (error) {
      console.error("Error generating test:", error);
      res.status(500).json({ message: "Failed to generate test" });
    }
  });

  // Submit test attempt
  app.post('/api/tests/:id/submit', isAuthenticated, async (req: any, res) => {
    try {
      const { id: testId } = req.params;
      const userId = req.user.claims.sub;
      const { answers, timeSpent } = req.body;

      // Validate request body
      const validatedData = insertTestAttemptSchema.parse({
        userId,
        testId,
        answers,
        timeSpent,
        score: 0, // Will be calculated
      });

      const test = await storage.getTest(testId);
      if (!test) {
        return res.status(404).json({ message: "Test not found" });
      }

      // Calculate score based on test type
      let score = 0;
      if (test.type === 'comprehension') {
        // For multiple choice, calculate based on correct answers
        const testContent = test.content as any;
        const questions = testContent.content?.questions || [];
        let correct = 0;
        
        questions.forEach((question: any, index: number) => {
          if (answers[index] === question.correctAnswer) {
            correct++;
          }
        });
        
        score = (correct / questions.length) * 10;
      } else {
        // For essay and letter writing, we'll get score from AI feedback
        score = 7.5; // Temporary score, will be updated after AI feedback
      }

      // Create test attempt
      const attempt = await storage.createTestAttempt({
        ...validatedData,
        score: score.toString(),
      });

      // Generate AI feedback for essay and letter writing
      if (test.type === 'essay' || test.type === 'letter') {
        try {
          const userResponse = typeof answers === 'string' ? answers : JSON.stringify(answers);
          const aiResult = await generateFeedback(test.type, userResponse, test.content as string);
          
          // Update attempt score with AI-generated overall score
          await storage.createTestAttempt({
            ...validatedData,
            score: aiResult.overallScore.toString(),
          });

          // Store AI feedback
          await storage.createAIFeedback({
            testAttemptId: attempt.id,
            ...aiResult,
          });
        } catch (aiError) {
          console.error("AI feedback generation failed:", aiError);
          // Continue without AI feedback
        }
      }

      // Update user streak and points
      const pointsEarned = Math.round(score * 10);
      await storage.updateUserStreak(userId);
      
      // Record daily activity
      await storage.recordDailyActivity({
        userId,
        date: new Date(),
        activitiesCompleted: 1,
        pointsEarned,
      });

      // Update user total points
      const user = await storage.getUser(userId);
      if (user) {
        await storage.upsertUser({
          ...user,
          totalPoints: (user.totalPoints || 0) + pointsEarned,
        });
      }

      res.json({ attempt, pointsEarned });
    } catch (error) {
      console.error("Error submitting test attempt:", error);
      res.status(500).json({ message: "Failed to submit test attempt" });
    }
  });

  // Get user test attempts
  app.get('/api/test-attempts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const attempts = await storage.getUserTestAttempts(userId);
      res.json(attempts);
    } catch (error) {
      console.error("Error fetching test attempts:", error);
      res.status(500).json({ message: "Failed to fetch test attempts" });
    }
  });

  // Get AI feedback for a test attempt
  app.get('/api/test-attempts/:id/feedback', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const feedback = await storage.getAIFeedbackByAttempt(id);
      res.json(feedback);
    } catch (error) {
      console.error("Error fetching AI feedback:", error);
      res.status(500).json({ message: "Failed to fetch AI feedback" });
    }
  });

  // Leaderboard endpoint
  app.get('/api/leaderboard', isAuthenticated, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const leaderboard = await storage.getLeaderboard(limit);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // User progress endpoint
  app.get('/api/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const [stats, streakHistory, achievements] = await Promise.all([
        storage.getUserStats(userId),
        storage.getUserStreakHistory(userId, 30),
        storage.getUserAchievements(userId),
      ]);

      res.json({
        stats,
        streakHistory,
        achievements,
      });
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  // Update daily activity (for streak management)
  app.post('/api/activity', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { activitiesCompleted, pointsEarned } = req.body;

      const activity = await storage.recordDailyActivity({
        userId,
        date: new Date(),
        activitiesCompleted: activitiesCompleted || 1,
        pointsEarned: pointsEarned || 0,
      });

      // Update user streak
      const updatedUser = await storage.updateUserStreak(userId);

      res.json({ activity, user: updatedUser });
    } catch (error) {
      console.error("Error updating activity:", error);
      res.status(500).json({ message: "Failed to update activity" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
