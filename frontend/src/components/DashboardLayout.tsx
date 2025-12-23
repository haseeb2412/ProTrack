import { ReactNode } from 'react';
import DashboardSidebar from './DashboardSidebar';
import { ChatWidgetWrapper } from './chat/ChatWidgetWrapper';
import { LucideIcon } from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

interface DashboardLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
}

export default function DashboardLayout({ children, navItems }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar navItems={navItems} />
      <main className="flex-1 p-6 lg:p-8 overflow-auto custom-scrollbar">
        {children}
      </main>
      <ChatWidgetWrapper />
    </div>
  );
}
