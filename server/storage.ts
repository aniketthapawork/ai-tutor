import {
  users,
  modules,
  tests,
  userModuleProgress,
  testAttempts,
  aiFeedback,
  streakHistory,
  achievements,
  type User,
  type UpsertUser,
  type Module,
  type InsertModule,
  type Test,
  type InsertTest,
  type UserModuleProgress,
  type InsertUserModuleProgress,
  type TestAttempt,
  type InsertTestAttempt,
  type AIFeedback,
  type InsertAIFeedback,
  type StreakHistory,
  type InsertStreakHistory,
  type Achievement,
  type InsertAchievement,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, gte, lte, count } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Module operations
  getAllModules(): Promise<Module[]>;
  getModulesByLevel(level: string): Promise<Module[]>;
  createModule(module: InsertModule): Promise<Module>;
  
  // User progress operations
  getUserModuleProgress(userId: string): Promise<UserModuleProgress[]>;
  updateModuleProgress(progress: InsertUserModuleProgress): Promise<UserModuleProgress>;
  
  // Test operations
  getAllTests(): Promise<Test[]>;
  getTestsByType(type: string): Promise<Test[]>;
  getTestsByLevel(level: string): Promise<Test[]>;
  getTest(id: string): Promise<Test | undefined>;
  createTest(test: InsertTest): Promise<Test>;
  
  // Test attempt operations
  getUserTestAttempts(userId: string): Promise<TestAttempt[]>;
  createTestAttempt(attempt: InsertTestAttempt): Promise<TestAttempt>;
  getTestAttempt(id: string): Promise<TestAttempt | undefined>;
  
  // AI Feedback operations
  createAIFeedback(feedback: InsertAIFeedback): Promise<AIFeedback>;
  getAIFeedbackByAttempt(attemptId: string): Promise<AIFeedback | undefined>;
  
  // Streak operations
  updateUserStreak(userId: string): Promise<User>;
  getUserStreakHistory(userId: string, days: number): Promise<StreakHistory[]>;
  recordDailyActivity(activity: InsertStreakHistory): Promise<StreakHistory>;
  
  // Leaderboard operations
  getLeaderboard(limit: number): Promise<Array<User & { rank: number }>>;
  
  // Achievement operations
  getUserAchievements(userId: string): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  
  // Analytics operations
  getUserStats(userId: string): Promise<{
    completedLessons: number;
    testsCompleted: number;
    averageScore: number;
    skillsBreakdown: {
      reading: number;
      essay: number;
      letter: number;
      grammar: number;
    };
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
  
  // Module operations
  async getAllModules(): Promise<Module[]> {
    return await db.select().from(modules).orderBy(modules.level, modules.order);
  }

  async getModulesByLevel(level: string): Promise<Module[]> {
    return await db.select().from(modules)
      .where(eq(modules.level, level))
      .orderBy(modules.order);
  }

  async createModule(moduleData: InsertModule): Promise<Module> {
    const [module] = await db.insert(modules).values(moduleData).returning();
    return module;
  }
  
  // User progress operations
  async getUserModuleProgress(userId: string): Promise<UserModuleProgress[]> {
    return await db.select().from(userModuleProgress)
      .where(eq(userModuleProgress.userId, userId));
  }

  async updateModuleProgress(progressData: InsertUserModuleProgress): Promise<UserModuleProgress> {
    const [progress] = await db
      .insert(userModuleProgress)
      .values(progressData)
      .onConflictDoUpdate({
        target: [userModuleProgress.userId, userModuleProgress.moduleId],
        set: {
          ...progressData,
          completedAt: progressData.completed ? new Date() : null,
        },
      })
      .returning();
    return progress;
  }
  
  // Test operations
  async getAllTests(): Promise<Test[]> {
    return await db.select().from(tests).orderBy(tests.level, tests.title);
  }

  async getTestsByType(type: string): Promise<Test[]> {
    return await db.select().from(tests)
      .where(eq(tests.type, type))
      .orderBy(tests.level);
  }

  async getTestsByLevel(level: string): Promise<Test[]> {
    return await db.select().from(tests)
      .where(eq(tests.level, level))
      .orderBy(tests.title);
  }

  async getTest(id: string): Promise<Test | undefined> {
    const [test] = await db.select().from(tests).where(eq(tests.id, id));
    return test;
  }

  async createTest(testData: InsertTest): Promise<Test> {
    const [test] = await db.insert(tests).values(testData).returning();
    return test;
  }
  
  // Test attempt operations
  async getUserTestAttempts(userId: string): Promise<TestAttempt[]> {
    return await db.select().from(testAttempts)
      .where(eq(testAttempts.userId, userId))
      .orderBy(desc(testAttempts.completedAt));
  }

  async createTestAttempt(attemptData: InsertTestAttempt): Promise<TestAttempt> {
    const [attempt] = await db.insert(testAttempts).values({
      ...attemptData,
      completedAt: new Date(),
    }).returning();
    return attempt;
  }

  async getTestAttempt(id: string): Promise<TestAttempt | undefined> {
    const [attempt] = await db.select().from(testAttempts).where(eq(testAttempts.id, id));
    return attempt;
  }
  
  // AI Feedback operations
  async createAIFeedback(feedbackData: InsertAIFeedback): Promise<AIFeedback> {
    const [feedback] = await db.insert(aiFeedback).values(feedbackData).returning();
    return feedback;
  }

  async getAIFeedbackByAttempt(attemptId: string): Promise<AIFeedback | undefined> {
    const [feedback] = await db.select().from(aiFeedback)
      .where(eq(aiFeedback.testAttemptId, attemptId));
    return feedback;
  }
  
  // Streak operations
  async updateUserStreak(userId: string): Promise<User> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    let newStreak = 1;
    
    if (user.lastActivityDate) {
      const lastActivity = new Date(user.lastActivityDate);
      lastActivity.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 0) {
        // Same day, no change to streak
        newStreak = user.currentStreak;
      } else if (daysDiff === 1) {
        // Consecutive day
        newStreak = user.currentStreak + 1;
      } else {
        // Streak broken
        newStreak = 1;
      }
    }
    
    const [updatedUser] = await db
      .update(users)
      .set({
        currentStreak: newStreak,
        lastActivityDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }

  async getUserStreakHistory(userId: string, days: number): Promise<StreakHistory[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return await db.select().from(streakHistory)
      .where(and(
        eq(streakHistory.userId, userId),
        gte(streakHistory.date, startDate)
      ))
      .orderBy(desc(streakHistory.date));
  }

  async recordDailyActivity(activityData: InsertStreakHistory): Promise<StreakHistory> {
    const [activity] = await db
      .insert(streakHistory)
      .values(activityData)
      .onConflictDoUpdate({
        target: [streakHistory.userId, streakHistory.date],
        set: {
          activitiesCompleted: sql`${streakHistory.activitiesCompleted} + ${activityData.activitiesCompleted}`,
          pointsEarned: sql`${streakHistory.pointsEarned} + ${activityData.pointsEarned}`,
        },
      })
      .returning();
    return activity;
  }
  
  // Leaderboard operations
  async getLeaderboard(limit: number): Promise<Array<User & { rank: number }>> {
    const leaderboardUsers = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        currentLevel: users.currentLevel,
        totalPoints: users.totalPoints,
        currentStreak: users.currentStreak,
        lastActivityDate: users.lastActivityDate,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .orderBy(desc(users.totalPoints), desc(users.currentStreak))
      .limit(limit);
    
    return leaderboardUsers.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));
  }
  
  // Achievement operations
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    return await db.select().from(achievements)
      .where(eq(achievements.userId, userId))
      .orderBy(desc(achievements.earnedAt));
  }

  async createAchievement(achievementData: InsertAchievement): Promise<Achievement> {
    const [achievement] = await db.insert(achievements).values({
      ...achievementData,
      earnedAt: new Date(),
    }).returning();
    return achievement;
  }
  
  // Analytics operations
  async getUserStats(userId: string): Promise<{
    completedLessons: number;
    testsCompleted: number;
    averageScore: number;
    skillsBreakdown: {
      reading: number;
      essay: number;
      letter: number;
      grammar: number;
    };
  }> {
    // Get completed lessons count
    const [lessonsResult] = await db
      .select({ count: count() })
      .from(userModuleProgress)
      .where(and(
        eq(userModuleProgress.userId, userId),
        eq(userModuleProgress.completed, true)
      ));
    
    // Get test attempts
    const userAttempts = await db.select({
      score: testAttempts.score,
      testType: tests.type,
    })
    .from(testAttempts)
    .innerJoin(tests, eq(testAttempts.testId, tests.id))
    .where(eq(testAttempts.userId, userId));
    
    // Get AI feedback for grammar scores
    const grammarScores = await db.select({
      grammarScore: aiFeedback.grammarScore,
    })
    .from(aiFeedback)
    .innerJoin(testAttempts, eq(aiFeedback.testAttemptId, testAttempts.id))
    .where(eq(testAttempts.userId, userId));
    
    const testsCompleted = userAttempts.length;
    const averageScore = testsCompleted > 0 
      ? userAttempts.reduce((sum, attempt) => sum + Number(attempt.score), 0) / testsCompleted
      : 0;
    
    // Calculate skills breakdown
    const readingTests = userAttempts.filter(a => a.testType === 'comprehension');
    const essayTests = userAttempts.filter(a => a.testType === 'essay');
    const letterTests = userAttempts.filter(a => a.testType === 'letter');
    
    const skillsBreakdown = {
      reading: readingTests.length > 0 
        ? readingTests.reduce((sum, test) => sum + Number(test.score), 0) / readingTests.length
        : 0,
      essay: essayTests.length > 0
        ? essayTests.reduce((sum, test) => sum + Number(test.score), 0) / essayTests.length
        : 0,
      letter: letterTests.length > 0
        ? letterTests.reduce((sum, test) => sum + Number(test.score), 0) / letterTests.length
        : 0,
      grammar: grammarScores.length > 0
        ? grammarScores.reduce((sum, score) => sum + Number(score.grammarScore), 0) / grammarScores.length
        : 0,
    };
    
    return {
      completedLessons: lessonsResult.count,
      testsCompleted,
      averageScore,
      skillsBreakdown,
    };
  }
}

export const storage = new DatabaseStorage();
