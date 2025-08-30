import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  user: any;
}

export default function Header({ user }: HeaderProps) {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: "fas fa-home" },
    { path: "/modules", label: "Modules", icon: "fas fa-book" },
    { path: "/progress", label: "Progress", icon: "fas fa-chart-line" },
  ];

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-graduation-cap text-primary-foreground text-lg"></i>
              </div>
              <h1 className="text-xl font-bold text-foreground">AI English Tutor</h1>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <span 
                  className={`${
                    location === item.path 
                      ? "text-primary font-medium border-b-2 border-primary pb-1" 
                      : "text-muted-foreground hover:text-foreground"
                  } transition-colors cursor-pointer`}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center space-x-4">
            {/* Streak Display */}
            <div className="flex items-center space-x-2 bg-accent/10 px-3 py-1 rounded-full">
              <i className="fas fa-fire text-accent"></i>
              <span className="text-sm font-medium" data-testid="text-header-streak">
                {user?.currentStreak || 0}
              </span>
              <span className="text-xs text-muted-foreground">day streak</span>
            </div>
            
            {/* User Avatar */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                {user?.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                    data-testid="img-user-avatar"
                  />
                ) : (
                  <span className="text-sm font-medium text-primary-foreground" data-testid="text-user-initials">
                    {getInitials(user?.firstName, user?.lastName)}
                  </span>
                )}
              </div>
              <span className="hidden sm:block text-sm font-medium" data-testid="text-user-full-name">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user?.firstName || user?.email || 'User'
                }
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.href = "/api/logout"}
                data-testid="button-logout"
              >
                <i className="fas fa-sign-out-alt"></i>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
