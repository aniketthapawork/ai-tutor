import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";

export default function QuickTests() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const generateTestMutation = useMutation({
    mutationFn: async ({ type, level }: { type: string; level: string }) => {
      const response = await apiRequest("POST", "/api/tests/generate", {
        type,
        level,
        count: 10,
      });
      return response.json();
    },
    onSuccess: (test) => {
      setLocation(`/test/${test.id}`);
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
        title: "Test Generation Failed",
        description: "Failed to generate test. Please try again.",
        variant: "destructive",
      });
    },
  });

  const tests = [
    {
      type: "comprehension",
      title: "Reading Comprehension",
      description: "Test your understanding skills",
      icon: "fas fa-book-open",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      time: "15 min",
    },
    {
      type: "essay",
      title: "Essay Writing", 
      description: "Practice composition skills",
      icon: "fas fa-pen-fancy",
      iconBg: "bg-accent/10",
      iconColor: "text-accent", 
      time: "30 min",
    },
    {
      type: "letter",
      title: "Letter Writing",
      description: "Formal and informal letters", 
      icon: "fas fa-envelope",
      iconBg: "bg-secondary/10",
      iconColor: "text-secondary",
      time: "20 min",
    },
  ];

  const handleStartTest = (testType: string) => {
    generateTestMutation.mutate({ 
      type: testType, 
      level: "intermediate" // Default to intermediate, could be based on user level
    });
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-6">Quick Tests</h2>
      <div className="space-y-4">
        {tests.map((test, index) => (
          <Card 
            key={test.type}
            className="test-card cursor-pointer hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            onClick={() => handleStartTest(test.type)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${test.iconBg} rounded-lg flex items-center justify-center`}>
                    <i className={`${test.icon} ${test.iconColor}`}></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground" data-testid={`text-quick-test-title-${index}`}>
                      {test.title}
                    </h3>
                    <p className="text-sm text-muted-foreground" data-testid={`text-quick-test-description-${index}`}>
                      {test.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-secondary" data-testid={`text-quick-test-time-${index}`}>
                    {test.time}
                  </div>
                  <div className="text-xs text-muted-foreground">Average time</div>
                  {generateTestMutation.isPending && (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mt-1"></div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
