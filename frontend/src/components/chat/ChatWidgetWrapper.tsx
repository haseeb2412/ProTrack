import { useEffect, useState } from 'react';
import ChatWidget from './ChatWidget';
import { useMessaging } from '@/contexts/MessagingContext';

// Wrapper to handle external events (like opening a specific group from notifications)
export function ChatWidgetWrapper() {
  const { chatGroups } = useMessaging();
  const [targetGroupId, setTargetGroupId] = useState<string | null>(null);

  useEffect(() => {
    const handleOpenChatGroup = (event: CustomEvent) => {
      setTargetGroupId(event.detail.groupId);
    };

    window.addEventListener('open-chat-group', handleOpenChatGroup as EventListener);

    return () => {
      window.removeEventListener('open-chat-group', handleOpenChatGroup as EventListener);
    };
  }, []);

  // Reset target group ID after a short delay
  useEffect(() => {
    if (targetGroupId) {
      const timer = setTimeout(() => setTargetGroupId(null), 100);
      return () => clearTimeout(timer);
    }
  }, [targetGroupId]);

  return <ChatWidget initialGroupId={targetGroupId} />;
}

