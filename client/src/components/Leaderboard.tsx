interface LeaderboardProps {
  leaderboard: any[];
  currentUser: any;
}

export default function Leaderboard({ leaderboard, currentUser }: LeaderboardProps) {
  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-accent text-accent-foreground";
      case 2:
        return "bg-muted text-muted-foreground";
      case 3:
        return "bg-primary text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-6">Leaderboard</h2>
      <div className="bg-card rounded-lg shadow-sm border border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Top Performers</h3>
          <span className="text-xs text-muted-foreground">This week</span>
        </div>
        
        <div className="space-y-3">
          {leaderboard && leaderboard.length > 0 ? (
            leaderboard.slice(0, 10).map((user: any, index: number) => (
              <div 
                key={user.id} 
                className={`flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 ${
                  user.id === currentUser?.id ? 'bg-primary/5 border border-primary/20' : ''
                }`}
              >
                <div className={`w-6 h-6 ${getRankIcon(user.rank)} rounded-full flex items-center justify-center`}>
                  <span className="text-xs font-bold" data-testid={`text-leaderboard-rank-${index}`}>
                    {user.rank}
                  </span>
                </div>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  {user.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                      data-testid={`img-leaderboard-avatar-${index}`}
                    />
                  ) : (
                    <span className="text-xs font-medium text-primary-foreground" data-testid={`text-leaderboard-initials-${index}`}>
                      {getInitials(user.firstName, user.lastName)}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium" data-testid={`text-leaderboard-name-${index}`}>
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}${user.id === currentUser?.id ? ' (You)' : ''}`
                      : user.email || 'User'
                    }
                  </div>
                  <div className="text-xs text-muted-foreground" data-testid={`text-leaderboard-points-${index}`}>
                    {user.totalPoints || 0} points
                  </div>
                </div>
                <div className="text-right">
                  <i className="fas fa-fire text-accent"></i>
                  <span className="text-xs ml-1" data-testid={`text-leaderboard-streak-${index}`}>
                    {user.currentStreak || 0}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <i className="fas fa-users text-4xl mb-4"></i>
              <p>No leaderboard data available yet.</p>
            </div>
          )}
        </div>
        
        <div className="mt-4 text-center">
          <button 
            className="text-sm text-primary hover:text-primary/80 font-medium"
            data-testid="button-view-full-leaderboard"
          >
            View Full Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}
