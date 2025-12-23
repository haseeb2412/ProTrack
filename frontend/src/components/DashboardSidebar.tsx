import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import NotificationDropdown from '@/components/chat/NotificationDropdown';
import { 
  ClipboardCheck, 
  Settings, 
  Users, 
  UsersRound, 
  BarChart3, 
  LogOut,
  ListTodo,
  Home,
  LucideIcon
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

interface DashboardSidebarProps {
  navItems: NavItem[];
}

export default function DashboardSidebar({ navItems }: DashboardSidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <aside className="w-64 min-h-screen bg-sidebar flex flex-col" style={{ background: 'var(--gradient-sidebar)' }}>
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <ClipboardCheck className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-sidebar-foreground">ProTrack</span>
        </Link>
      </div>

      {/* Profile Section */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12 border-2 border-sidebar-primary">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground">
              {user?.name ? getInitials(user.name) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sidebar-foreground truncate">{user?.name}</p>
            <p className="text-sm text-sidebar-foreground/60 truncate">{user?.designation}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-11 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200",
                  isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Notifications and Logout */}
      <div className="p-4 border-t border-sidebar-border space-y-1">
        <NotificationDropdown />
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-11 text-sidebar-foreground/80 hover:bg-destructive/20 hover:text-destructive transition-all duration-200"
          onClick={logout}
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </div>
    </aside>
  );
}

// Export icon components for use in nav items
export { Settings, Users, UsersRound, BarChart3, ListTodo, Home };
