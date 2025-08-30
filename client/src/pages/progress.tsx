import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";

export default function Progress() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  const { data: progressData, isLoading: isProgressLoading, error } = useQuery({
    queryKey: ["/api/progress"],
    retry: false,
  });

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

  if (isLoading || isProgressLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse">
          <div className="h-16 bg-card border-b"></div>
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-card rounded-lg"></div>
              <div className="h-64 bg-card rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && isUnauthorizedError(error as Error)) {
    return null;
  }

  const { stats, streakHistory, achievements } = progressData || {};

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Your Progress</h1>
          <p className="text-muted-foreground">Track your learning journey and achievements</p>
        </div>

        {/* Skills Breakdown */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-6">Skills Breakdown</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Skill Levels</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Reading Comprehension</span>
                      <span className="text-sm text-secondary font-medium" data-testid="text-reading-score">
                        {stats?.skillsBreakdown?.reading?.toFixed(1) || '0.0'}/10
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-secondary h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${(stats?.skillsBreakdown?.reading || 0) * 10}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Essay Writing</span>
                      <span className="text-sm text-primary font-medium" data-testid="text-essay-score">
                        {stats?.skillsBreakdown?.essay?.toFixed(1) || '0.0'}/10
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${(stats?.skillsBreakdown?.essay || 0) * 10}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Letter Writing</span>
                      <span className="text-sm text-accent font-medium" data-testid="text-letter-score">
                        {stats?.skillsBreakdown?.letter?.toFixed(1) || '0.0'}/10
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-accent h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${(stats?.skillsBreakdown?.letter || 0) * 10}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Grammar & Syntax</span>
                      <span className="text-sm text-secondary font-medium" data-testid="text-grammar-score">
                        {stats?.skillsBreakdown?.grammar?.toFixed(1) || '0.0'}/10
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-secondary h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${(stats?.skillsBreakdown?.grammar || 0) * 10}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Recent Achievements</h3>
                <div className="space-y-4">
                  {achievements && achievements.length > 0 ? (
                    achievements.map((achievement: any, index: number) => (
                      <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-accent/5 rounded-lg border border-accent/20">
                        <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                          <i className="fas fa-trophy text-accent-foreground"></i>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground" data-testid={`text-achievement-title-${index}`}>
                            {achievement.title}
                          </h4>
                          <p className="text-xs text-muted-foreground" data-testid={`text-achievement-description-${index}`}>
                            {achievement.description}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground" data-testid={`text-achievement-date-${index}`}>
                          {new Date(achievement.earnedAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <i className="fas fa-trophy text-4xl mb-4"></i>
                      <p>No achievements yet. Keep learning to earn your first achievement!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Learning Goals */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-6">Learning Goals</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-foreground mb-4">Weekly Target</h3>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-secondary" data-testid="text-weekly-progress">
                    {Math.min(7, streakHistory?.filter((day: any) => {
                      const dayDate = new Date(day.date);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return dayDate >= weekAgo && day.activitiesCompleted > 0;
                    }).length || 0)}/7
                  </div>
                  <div className="text-sm text-muted-foreground">Days completed</div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-secondary h-2 rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${Math.min(100, ((streakHistory?.filter((day: any) => {
                        const dayDate = new Date(day.date);
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return dayDate >= weekAgo && day.activitiesCompleted > 0;
                      }).length || 0) / 7) * 100)}%` 
                    }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-foreground mb-4">Monthly Target</h3>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-primary" data-testid="text-monthly-progress">
                    {stats?.testsCompleted || 0}/25
                  </div>
                  <div className="text-sm text-muted-foreground">Tests completed</div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, ((stats?.testsCompleted || 0) / 25) * 100)}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-foreground mb-4">Overall Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Average Score</span>
                    <span className="text-sm font-medium" data-testid="text-average-score">
                      {stats?.averageScore?.toFixed(1) || '0.0'}/10
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Points</span>
                    <span className="text-sm font-medium" data-testid="text-total-points">
                      {user?.totalPoints || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Current Streak</span>
                    <span className="text-sm font-medium" data-testid="text-progress-streak">
                      {user?.currentStreak || 0} days
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
