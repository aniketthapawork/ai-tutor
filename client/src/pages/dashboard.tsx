import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";
import Header from "@/components/Header";
import LevelModules from "@/components/LevelModules";
import QuickTests from "@/components/QuickTests";
import Leaderboard from "@/components/Leaderboard";
import StreakDisplay from "@/components/StreakDisplay";
import ProgressAnalytics from "@/components/ProgressAnalytics";
import { Card, CardContent } from "@/components/ui/card";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  const { data: dashboardData, isLoading: isDashboardLoading, error } = useQuery({
    queryKey: ["/api/dashboard"],
    retry: false,
  });

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || isDashboardLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse">
          <div className="h-16 bg-card border-b"></div>
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 h-48 bg-card rounded-lg"></div>
              <div className="h-48 bg-card rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    if (isUnauthorizedError(error as Error)) {
      return null; // Will redirect via useEffect
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <i className="fas fa-exclamation-triangle text-destructive text-3xl mb-4"></i>
              <h2 className="text-xl font-semibold text-foreground mb-2">Something went wrong</h2>
              <p className="text-muted-foreground mb-4">
                Failed to load dashboard data. Please try again.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
                data-testid="button-retry"
              >
                Retry
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { user, stats, recentAttempts, leaderboard, achievements } = dashboardData || {};

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <section className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Welcome Card */}
            <div className="lg:col-span-2 bg-card rounded-lg shadow-sm border border-border p-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Welcome back, <span data-testid="text-user-name">{user?.firstName || 'Learner'}</span>!
              </h2>
              <p className="text-muted-foreground mb-4">Continue your English learning journey. You're doing great!</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary" data-testid="text-completed-lessons">
                    {stats?.completedLessons || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Lessons</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary" data-testid="text-tests-completed">
                    {stats?.testsCompleted || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Tests</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent" data-testid="text-current-streak">
                    {user?.currentStreak || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Day Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-destructive" data-testid="text-user-ranking">
                    #{leaderboard?.findIndex((u: any) => u.id === user?.id) + 1 || '--'}
                  </div>
                  <div className="text-sm text-muted-foreground">Ranking</div>
                </div>
              </div>
            </div>
            
            {/* Quick Progress Card */}
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <h3 className="text-lg font-semibold mb-4">Overall Progress</h3>
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-24 h-24">
                  <svg className="progress-ring w-24 h-24 transform -rotate-90">
                    <circle 
                      cx="48" 
                      cy="48" 
                      r="40" 
                      stroke="hsl(var(--muted))" 
                      strokeWidth="8" 
                      fill="transparent"
                    />
                    <circle 
                      cx="48" 
                      cy="48" 
                      r="40" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth="8" 
                      fill="transparent"
                      strokeDasharray="251.2" 
                      strokeDashoffset={251.2 - (251.2 * (stats?.averageScore || 0) / 10)}
                      className="progress-ring-circle transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-primary" data-testid="text-overall-progress">
                      {Math.round((stats?.averageScore || 0) * 10)}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Keep going! You're making excellent progress.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Level Modules */}
        <LevelModules user={user} stats={stats} />

        {/* Quick Actions */}
        <section className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <QuickTests />
            <Leaderboard leaderboard={leaderboard} currentUser={user} />
          </div>
        </section>

        {/* Recent Activity & AI Feedback */}
        {recentAttempts && recentAttempts.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-6">Recent Activity & AI Feedback</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Tests */}
              <div className="bg-card rounded-lg shadow-sm border border-border p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Tests</h3>
                <div className="space-y-4">
                  {recentAttempts.slice(0, 3).map((item: any, index: number) => (
                    <div key={item.attempt.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground" data-testid={`text-test-title-${index}`}>
                          {item.test?.title || 'Test'}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-secondary" data-testid={`text-test-score-${index}`}>
                            {Number(item.attempt.score).toFixed(1)}
                          </span>
                          <span className="text-sm text-muted-foreground">/10</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span data-testid={`text-test-date-${index}`}>
                          <i className="far fa-calendar mr-1"></i>
                          {new Date(item.attempt.completedAt).toLocaleDateString()}
                        </span>
                        <span data-testid={`text-test-time-${index}`}>
                          <i className="far fa-clock mr-1"></i>
                          {item.attempt.timeSpent || 0} min
                        </span>
                        <span data-testid={`text-test-points-${index}`}>
                          <i className="fas fa-star text-accent mr-1"></i>
                          +{Math.round(Number(item.attempt.score) * 10)} points
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* AI Feedback Panel */}
              <div className="bg-card rounded-lg shadow-sm border border-border p-6">
                <h3 className="text-lg font-semibold mb-4">Latest AI Feedback</h3>
                {recentAttempts[0]?.feedback ? (
                  <div className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <i className="fas fa-robot text-primary-foreground text-sm"></i>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground mb-2">Grammar Analysis</h4>
                          <p className="text-sm text-muted-foreground mb-3" data-testid="text-ai-feedback-strengths">
                            {recentAttempts[0].feedback.strengths}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span className="bg-secondary/10 text-secondary text-xs px-2 py-1 rounded">
                              Grammar: {Number(recentAttempts[0].feedback.grammarScore).toFixed(1)}/10
                            </span>
                            <span className="bg-accent/10 text-accent text-xs px-2 py-1 rounded">
                              Vocabulary: {Number(recentAttempts[0].feedback.vocabularyScore).toFixed(1)}/10
                            </span>
                            <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                              Structure: {Number(recentAttempts[0].feedback.structureScore).toFixed(1)}/10
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                          <i className="fas fa-lightbulb text-accent-foreground text-sm"></i>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground mb-2">Improvement Suggestion</h4>
                          <p className="text-sm text-muted-foreground" data-testid="text-ai-feedback-improvements">
                            {recentAttempts[0].feedback.improvements}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <i className="fas fa-clipboard-list text-4xl mb-4"></i>
                    <p>Complete a test to see AI feedback here</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Streak Management */}
        <StreakDisplay user={user} />

        {/* Progress Analytics */}
        <ProgressAnalytics stats={stats} achievements={achievements} />
      </main>
    </div>
  );
}
