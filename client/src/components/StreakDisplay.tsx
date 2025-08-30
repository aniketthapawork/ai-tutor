import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StreakDisplayProps {
  user: any;
}

export default function StreakDisplay({ user }: StreakDisplayProps) {
  // Calculate week days and streak status
  const getWeekDays = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const currentDay = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
    
    return days.map((day, index) => {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + index);
      const isToday = dayDate.toDateString() === today.toDateString();
      const isPast = dayDate < today;
      const isCompleted = isPast || (isToday && user?.lastActivityDate && 
        new Date(user.lastActivityDate).toDateString() === today.toDateString());
      
      return {
        label: day,
        completed: isCompleted,
        isToday,
        isPast,
      };
    });
  };

  const weekDays = getWeekDays();
  const currentStreak = user?.currentStreak || 0;
  
  // Calculate streak milestones
  const milestones = [
    { days: 7, title: "Achiever", achieved: currentStreak >= 7 },
    { days: 14, title: "Dedicated", achieved: currentStreak >= 14 },
    { days: 30, title: "Champion", achieved: currentStreak >= 30 },
  ];

  // Calculate today's goals progress
  const todayGoals = [
    { 
      icon: "fas fa-check", 
      text: "Complete 1 lesson", 
      completed: true,
      color: "bg-secondary/10 text-secondary"
    },
    { 
      icon: "fas fa-clock", 
      text: "Study for 20 minutes", 
      completed: false,
      progress: "15/20",
      color: "bg-accent/10 text-accent"
    },
    { 
      icon: "fas fa-tasks", 
      text: "Take 1 practice test", 
      completed: false,
      color: "bg-primary/10 text-primary"
    },
  ];

  return (
    <section className="mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Streak Progress */}
        <div className="lg:col-span-2 bg-card rounded-lg shadow-sm border border-border p-6">
          <h2 className="text-xl font-bold text-foreground mb-6">Daily Learning Streak</h2>
          
          {/* Weekly Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">This Week</h3>
              <span className="text-sm text-muted-foreground" data-testid="text-week-progress">
                {weekDays.filter(day => day.completed).length} of 7 days completed
              </span>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs text-muted-foreground mb-1" data-testid={`text-day-label-${index}`}>
                    {day.label}
                  </div>
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      day.completed 
                        ? 'bg-secondary' 
                        : day.isToday 
                          ? 'bg-muted border-2 border-dashed border-border' 
                          : 'bg-muted border-2 border-dashed border-border'
                    }`}
                    data-testid={`streak-day-${index}`}
                  >
                    {day.completed ? (
                      <i className="fas fa-check text-secondary-foreground text-xs"></i>
                    ) : day.isToday ? (
                      <span className="text-xs text-muted-foreground">?</span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Streak Milestones */}
          <div className="border-t border-border pt-4">
            <h4 className="font-semibold text-foreground mb-3">Streak Milestones</h4>
            <div className="flex items-center space-x-4 overflow-x-auto pb-2">
              {milestones.map((milestone, index) => (
                <div 
                  key={index}
                  className={`flex-shrink-0 text-center p-3 rounded-lg border ${
                    milestone.achieved 
                      ? 'bg-secondary/10 border-secondary/20' 
                      : 'bg-muted'
                  }`}
                  data-testid={`milestone-${index}`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-1 ${
                    milestone.achieved 
                      ? 'bg-secondary' 
                      : 'bg-muted-foreground/20'
                  }`}>
                    {milestone.achieved ? (
                      <i className="fas fa-check text-secondary-foreground text-xs"></i>
                    ) : (
                      <span className="text-xs text-muted-foreground">{milestone.days}</span>
                    )}
                  </div>
                  <div className="text-xs font-medium">{milestone.days} days</div>
                  <div className="text-xs text-muted-foreground">{milestone.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Today's Goal */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Today's Goal</h3>
          
          <div className="space-y-4">
            {todayGoals.map((goal, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${goal.color} rounded-lg flex items-center justify-center`}>
                    <i className={goal.icon}></i>
                  </div>
                  <span className="text-sm" data-testid={`text-goal-${index}`}>{goal.text}</span>
                </div>
                <div className="flex items-center">
                  {goal.completed ? (
                    <i className="fas fa-check-circle text-secondary" data-testid={`icon-goal-completed-${index}`}></i>
                  ) : goal.progress ? (
                    <div className="text-sm text-accent font-medium" data-testid={`text-goal-progress-${index}`}>
                      {goal.progress}
                    </div>
                  ) : (
                    <i className="far fa-circle text-muted-foreground" data-testid={`icon-goal-incomplete-${index}`}></i>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {currentStreak > 0 && (
            <div className="mt-6 p-3 bg-accent/10 rounded-lg">
              <div className="flex items-center space-x-2">
                <i className="fas fa-fire text-accent streak-flame"></i>
                <span className="text-sm font-medium text-accent" data-testid="text-streak-reminder">
                  Great job! You're on a {currentStreak} day streak!
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
