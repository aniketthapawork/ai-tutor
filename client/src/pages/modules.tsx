import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Modules() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  const { data: modules, isLoading: isModulesLoading, error } = useQuery({
    queryKey: ["/api/modules"],
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

  if (isLoading || isModulesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse">
          <div className="h-16 bg-card border-b"></div>
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-card rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && isUnauthorizedError(error as Error)) {
    return null;
  }

  const groupedModules = modules?.reduce((acc: any, module: any) => {
    if (!acc[module.level]) acc[module.level] = [];
    acc[module.level].push(module);
    return acc;
  }, {}) || {};

  const levelConfig = {
    beginner: {
      title: "Beginner",
      icon: "fas fa-seedling",
      color: "bg-gradient-to-r from-secondary to-secondary/80",
      description: "Foundation skills"
    },
    intermediate: {
      title: "Intermediate", 
      icon: "fas fa-tree",
      color: "bg-gradient-to-r from-primary to-accent",
      description: "Building fluency"
    },
    advanced: {
      title: "Advanced",
      icon: "fas fa-crown", 
      color: "bg-gradient-to-r from-muted to-muted-foreground/20",
      description: "Master level skills"
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Learning Modules</h1>
          <p className="text-muted-foreground">Progress through structured lessons at your own pace</p>
        </div>

        {Object.entries(levelConfig).map(([level, config]: [string, any]) => (
          <section key={level} className="mb-12">
            <div className="flex items-center space-x-3 mb-6">
              <div className={`w-12 h-12 ${config.color} rounded-lg flex items-center justify-center`}>
                <i className={`${config.icon} text-white text-xl`}></i>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{config.title}</h2>
                <p className="text-muted-foreground">{config.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedModules[level]?.map((module: any, index: number) => (
                <Card key={module.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-foreground" data-testid={`text-module-title-${level}-${index}`}>
                        {module.title}
                      </h3>
                      {module.completed && (
                        <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                          <i className="fas fa-check mr-1"></i>
                          Completed
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4" data-testid={`text-module-description-${level}-${index}`}>
                      {module.description}
                    </p>
                    
                    {module.score && (
                      <div className="flex items-center space-x-2 mb-4">
                        <span className="text-sm text-muted-foreground">Score:</span>
                        <span className="text-sm font-medium text-secondary" data-testid={`text-module-score-${level}-${index}`}>
                          {Number(module.score).toFixed(1)}/10
                        </span>
                      </div>
                    )}
                    
                    <Button 
                      className="w-full" 
                      variant={module.completed ? "outline" : "default"}
                      data-testid={`button-module-${level}-${index}`}
                    >
                      {module.completed ? "Review" : "Start Learning"}
                    </Button>
                  </CardContent>
                </Card>
              )) || (
                <div className="col-span-full text-center py-12">
                  <i className="fas fa-book text-4xl text-muted-foreground mb-4"></i>
                  <p className="text-muted-foreground">No modules available for this level yet.</p>
                </div>
              )}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
