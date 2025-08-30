import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProgressAnalyticsProps {
  stats: any;
  achievements: any[];
}

export default function ProgressAnalytics({ stats, achievements }: ProgressAnalyticsProps) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-foreground mb-6">Progress Analytics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skills Breakdown */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Skills Breakdown</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Reading Comprehension</span>
                  <span className="text-sm text-secondary font-medium" data-testid="text-analytics-reading">
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
                  <span className="text-sm text-primary font-medium" data-testid="text-analytics-essay">
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
                  <span className="text-sm text-accent font-medium" data-testid="text-analytics-letter">
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
                  <span className="text-sm text-secondary font-medium" data-testid="text-analytics-grammar">
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
                  <div 
                    key={achievement.id} 
                    className="flex items-center space-x-3 p-3 bg-accent/5 rounded-lg border border-accent/20"
                  >
                    <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                      <i className="fas fa-trophy text-accent-foreground"></i>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground" data-testid={`text-recent-achievement-title-${index}`}>
                        {achievement.title}
                      </h4>
                      <p className="text-xs text-muted-foreground" data-testid={`text-recent-achievement-description-${index}`}>
                        {achievement.description}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground" data-testid={`text-recent-achievement-date-${index}`}>
                      {new Date(achievement.earnedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <i className="fas fa-trophy text-4xl mb-4"></i>
                  <p>Complete lessons and tests to earn achievements!</p>
                </div>
              )}
            </div>
            
            {/* Learning Goals */}
            <div className="mt-6 pt-4 border-t border-border">
              <h4 className="font-semibold text-foreground mb-3">Learning Goals</h4>
              
              <div className="space-y-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Weekly Target</span>
                    <span className="text-sm text-secondary font-medium" data-testid="text-weekly-target">
                      5/7
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-secondary h-2 rounded-full transition-all duration-500" style={{ width: '71%' }}></div>
                  </div>
                </div>
                
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Monthly Target</span>
                    <span className="text-sm text-primary font-medium" data-testid="text-monthly-target">
                      {stats?.testsCompleted || 0}/25
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, ((stats?.testsCompleted || 0) / 25) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full text-accent border-accent hover:bg-accent/10"
                  data-testid="button-set-custom-goal"
                >
                  Set Custom Goal
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
