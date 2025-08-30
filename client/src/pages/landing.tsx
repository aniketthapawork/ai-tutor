import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-graduation-cap text-primary-foreground text-xl"></i>
            </div>
            <h1 className="text-3xl font-bold text-foreground">AI English Tutor</h1>
          </div>
          
          <h2 className="text-5xl font-bold text-foreground mb-6">
            Master English with
            <span className="text-primary block">Personalized AI Learning</span>
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Level-wise modules, instant AI feedback, and gamified learning to help you become fluent in English.
          </p>
          
          <Button 
            size="lg" 
            className="text-lg px-8 py-6"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-login"
          >
            Start Learning Today
            <i className="fas fa-arrow-right ml-2"></i>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-layer-group text-primary text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Level-wise Learning</h3>
              <p className="text-muted-foreground">
                Progress through Beginner, Intermediate, and Advanced levels at your own pace.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-robot text-accent text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Feedback</h3>
              <p className="text-muted-foreground">
                Get instant, detailed feedback on grammar, vocabulary, and writing structure.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-trophy text-secondary text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Gamified Experience</h3>
              <p className="text-muted-foreground">
                Build streaks, earn achievements, and compete on the leaderboard.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h3 className="text-2xl font-bold text-foreground mb-8">What You'll Learn</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3 p-4 bg-card rounded-lg border">
              <i className="fas fa-book-open text-primary"></i>
              <span className="font-medium">Reading Comprehension</span>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-card rounded-lg border">
              <i className="fas fa-pen-fancy text-accent"></i>
              <span className="font-medium">Essay Writing</span>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-card rounded-lg border">
              <i className="fas fa-envelope text-secondary"></i>
              <span className="font-medium">Letter Writing</span>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-card rounded-lg border">
              <i className="fas fa-spell-check text-primary"></i>
              <span className="font-medium">Grammar & Syntax</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
