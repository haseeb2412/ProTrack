import { useState } from 'react';
import { useMessaging } from '@/contexts/MessagingContext';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Bell, MessageSquare, Users, X } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { ChatWidget } from './ChatWidgetWrapper';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markNotificationAsRead, getUnreadNotificationCount, clearAllNotifications } = useMessaging();
  const unreadCount = getUnreadNotificationCount();
  const navigate = useNavigate();

  const handleNotificationClick = (notification: any) => {
    markNotificationAsRead(notification.id);
    setIsOpen(false);

    if (notification.groupId) {
      // Open chat widget and navigate to group
      // This will be handled by ChatWidgetWrapper
      window.dispatchEvent(new CustomEvent('open-chat-group', { detail: { groupId: notification.groupId } }));
    }
  };

  const handleClearAll = () => {
    clearAllNotifications();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'group_invite':
        return <Users className="w-4 h-4" />;
      case 'message':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-11 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 relative"
        >
          <Bell className="w-5 h-5" />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute top-1 right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 shadow-xl border-2" align="end">
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearAll} className="h-8">
              Clear all
            </Button>
          )}
        </div>
        <ScrollArea className="h-96">
          {sortedNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <Bell className="w-16 h-16 text-muted-foreground mb-4 opacity-30" />
              <p className="text-sm text-muted-foreground font-medium">No notifications</p>
              <p className="text-xs text-muted-foreground/70 mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {sortedNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-accent/50 cursor-pointer transition-all duration-200 ${
                    !notification.isRead ? 'bg-gradient-to-r from-primary/5 to-transparent border-l-2 border-l-primary' : 'bg-background'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 p-2 rounded-lg ${
                      notification.type === 'group_invite' ? 'bg-blue-500/10 text-blue-600' :
                      notification.type === 'message' ? 'bg-green-500/10 text-green-600' :
                      'bg-purple-500/10 text-purple-600'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.isRead ? 'font-semibold' : 'font-medium'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                        <span>{format(new Date(notification.createdAt), 'MMM d, yyyy')}</span>
                        <span>•</span>
                        <span>{format(new Date(notification.createdAt), 'HH:mm')}</span>
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary mt-2 animate-pulse" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

