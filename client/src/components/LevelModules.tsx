import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface LevelModulesProps {
  user: any;
  stats: any;
}

export default function LevelModules({ user, stats }: LevelModulesProps) {
  const levels = [
    {
      id: "beginner",
      title: "Beginner",
      description: "Foundation skills",
      icon: "fas fa-seedling",
      gradient: "level-badge bg-gradient-to-r from-secondary to-secondary/80",
      progress: 85, // This would be calculated from actual progress
      topics: ["Basic Grammar", "Simple Sentences", "Basic Vocabulary"],
      unlocked: true,
    },
    {
      id: "intermediate", 
      title: "Intermediate",
      description: "Building fluency",
      icon: "fas fa-tree",
      gradient: "bg-gradient-to-r from-primary to-accent",
      progress: 45,
      topics: ["Complex Grammar", "Essay Writing", "Advanced Vocabulary"],
      unlocked: true,
    },
    {
      id: "advanced",
      title: "Advanced", 
      description: "Master level skills",
      icon: "fas fa-crown",
      gradient: "bg-gradient-to-r from-muted to-muted-foreground/20",
      progress: 0,
      topics: ["Professional Writing", "Literary Analysis", "Academic Writing"],
      unlocked: false,
    },
  ];

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-foreground mb-6">Learning Modules</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {levels.map((level, index) => (
          <Card key={level.id} className={`overflow-hidden ${!level.unlocked ? 'opacity-75' : ''}`}>
            <div className={`${level.gradient} text-primary-foreground p-4`}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold" data-testid={`text-level-title-${index}`}>
                  {level.title}
                </h3>
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <i className={`${level.icon} text-white text-sm`}></i>
                </div>
              </div>
              <p className="text-sm opacity-90 mt-1">{level.description}</p>
            </div>
            
            <CardContent className="p-4">
              {level.unlocked ? (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">Progress</span>
                    <span className="text-sm font-medium text-secondary" data-testid={`text-level-progress-${index}`}>
                      {level.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mb-4">
                    <div 
                      className="bg-secondary h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${level.progress}%` }}
                    ></div>
                  </div>
                  <div className="space-y-2 mb-4">
                    {level.topics.map((topic, topicIndex) => (
                      <div key={topicIndex} className="flex items-center text-sm">
                        <i className={`${topicIndex < 2 ? 'fas fa-check-circle text-secondary' : 'far fa-circle text-muted-foreground'} mr-2`}></i>
                        <span data-testid={`text-topic-${index}-${topicIndex}`}>{topic}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/modules">
                    <Button className="w-full" data-testid={`button-continue-learning-${index}`}>
                      Continue Learning
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">Locked</span>
                    <i className="fas fa-lock text-muted-foreground"></i>
                  </div>
                  <div className="space-y-2 mb-4">
                    {level.topics.map((topic, topicIndex) => (
                      <div key={topicIndex} className="flex items-center text-sm text-muted-foreground">
                        <i className="far fa-circle mr-2"></i>
                        <span>{topic}</span>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full" variant="secondary" disabled data-testid={`button-locked-level-${index}`}>
                    Complete Intermediate First
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
