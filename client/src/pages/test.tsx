import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Test() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTestStarted, setIsTestStarted] = useState(false);

  const { data: test, isLoading: isTestLoading, error } = useQuery({
    queryKey: ["/api/tests", id],
    enabled: !!id,
    retry: false,
  });

  const submitTestMutation = useMutation({
    mutationFn: async ({ testId, answers, timeSpent }: any) => {
      return await apiRequest("POST", `/api/tests/${testId}/submit`, {
        answers,
        timeSpent,
      });
    },
    onSuccess: () => {
      toast({
        title: "Test Submitted!",
        description: "Your test has been submitted successfully. Check your feedback in the dashboard.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setLocation("/");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Submission Failed",
        description: "Failed to submit test. Please try again.",
        variant: "destructive",
      });
    },
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

  useEffect(() => {
    if (test && isTestStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [test, isTestStarted, timeRemaining]);

  const handleStartTest = () => {
    if (test) {
      setIsTestStarted(true);
      setTimeRemaining((test.timeLimit || 15) * 60); // Convert minutes to seconds
    }
  };

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: value
    }));
  };

  const handleNextQuestion = () => {
    const testContent = test?.content as any;
    const questions = testContent?.content?.questions || [];
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmitTest = () => {
    if (!test) return;
    
    const timeSpent = Math.round(((test.timeLimit || 15) * 60 - timeRemaining) / 60);
    
    submitTestMutation.mutate({
      testId: test.id,
      answers,
      timeSpent,
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading || isTestLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse">
          <div className="h-16 bg-card border-b"></div>
          <div className="container mx-auto px-4 py-8">
            <div className="h-96 bg-card rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && isUnauthorizedError(error as Error)) {
    return null;
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <i className="fas fa-question-circle text-4xl text-muted-foreground mb-4"></i>
              <h2 className="text-xl font-semibold mb-2">Test Not Found</h2>
              <p className="text-muted-foreground mb-4">The requested test could not be found.</p>
              <Button onClick={() => setLocation("/")} data-testid="button-back-dashboard">
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const testContent = test.content as any;
  const questions = testContent?.content?.questions || [];
  const passage = testContent?.content?.passage;
  
  if (!isTestStarted) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-test-title">
                  {test.title}
                </h1>
                <p className="text-muted-foreground">
                  {test.type.charAt(0).toUpperCase() + test.type.slice(1)} Test - {test.level} Level
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <i className="fas fa-clock text-primary text-2xl mb-2"></i>
                  <div className="font-semibold" data-testid="text-time-limit">{test.timeLimit} minutes</div>
                  <div className="text-sm text-muted-foreground">Time limit</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <i className="fas fa-list text-accent text-2xl mb-2"></i>
                  <div className="font-semibold" data-testid="text-question-count">{questions.length} questions</div>
                  <div className="text-sm text-muted-foreground">Total questions</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <i className="fas fa-star text-secondary text-2xl mb-2"></i>
                  <div className="font-semibold" data-testid="text-max-score">{test.maxScore} points</div>
                  <div className="text-sm text-muted-foreground">Maximum score</div>
                </div>
              </div>

              <div className="text-center">
                <Button 
                  size="lg" 
                  onClick={handleStartTest}
                  data-testid="button-start-test"
                >
                  Start Test
                  <i className="fas fa-play ml-2"></i>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Test Header */}
        <div className="flex items-center justify-between mb-6 p-4 bg-muted rounded-lg">
          <div>
            <h1 className="font-semibold text-foreground" data-testid="text-active-test-title">{test.title}</h1>
            <p className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <i className="far fa-clock text-muted-foreground"></i>
              <span className="text-sm font-medium" data-testid="text-time-remaining">
                {formatTime(timeRemaining)}
              </span>
            </div>
            <div className="w-32 bg-border rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Reading Passage (for comprehension tests) */}
          {passage && (
            <div className="bg-muted/30 rounded-lg p-6">
              <h2 className="font-semibold text-foreground mb-4">Reading Passage</h2>
              <div className="prose text-sm text-foreground max-w-none" data-testid="text-reading-passage">
                {passage.split('\n').map((paragraph: string, index: number) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </div>
          )}

          {/* Question Interface */}
          <div className={passage ? "" : "lg:col-span-2"}>
            <h2 className="font-semibold text-foreground mb-4">
              {test.type === 'comprehension' ? 'Question' : 
               test.type === 'essay' ? 'Essay Prompt' : 'Letter Writing Task'}
            </h2>
            
            {currentQ && (
              <>
                <p className="text-foreground mb-6" data-testid="text-current-question">
                  {currentQ.question}
                </p>

                {/* Multiple Choice Questions */}
                {currentQ.options && (
                  <RadioGroup 
                    value={answers[currentQuestion] || ""} 
                    onValueChange={handleAnswerChange}
                    className="space-y-3 mb-6"
                  >
                    {currentQ.options.map((option: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2 p-3 border border-border rounded-lg hover:bg-muted/50">
                        <RadioGroupItem 
                          value={option} 
                          id={`option-${index}`}
                          data-testid={`radio-answer-${index}`}
                        />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {/* Text Response (Essay/Letter) */}
                {(test.type === 'essay' || test.type === 'letter') && (
                  <div className="mb-6">
                    <Textarea 
                      value={answers[currentQuestion] || ""}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      placeholder={`Write your ${test.type} here...`}
                      className="min-h-64"
                      data-testid="textarea-response"
                    />
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <Button 
                    variant="outline"
                    onClick={handlePrevQuestion}
                    disabled={currentQuestion === 0}
                    data-testid="button-previous-question"
                  >
                    <i className="fas fa-arrow-left mr-2"></i>
                    Previous
                  </Button>
                  
                  {currentQuestion === questions.length - 1 ? (
                    <Button 
                      onClick={handleSubmitTest}
                      disabled={submitTestMutation.isPending}
                      data-testid="button-submit-test"
                    >
                      {submitTestMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Test
                          <i className="fas fa-check ml-2"></i>
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleNextQuestion}
                      data-testid="button-next-question"
                    >
                      Next
                      <i className="fas fa-arrow-right ml-2"></i>
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
