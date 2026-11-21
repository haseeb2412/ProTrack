import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ChatGroup, Message, Notification, UserRole } from '@/types';
import { useAuth } from './AuthContext';
import { messagingApi, notificationApi } from '@/lib/api';
import { toast } from 'sonner';

interface MessagingContextType {
  chatGroups: ChatGroup[];
  messages: Record<string, Message[]>;
  notifications: Notification[];
  createGroup: (name: string, memberIds: string[]) => Promise<ChatGroup | null>;
  sendMessage: (groupId: string, content: string) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => void;
  getUnreadNotificationCount: () => number;
  clearAllNotifications: () => void;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);
const roles: Record<string, UserRole> = { STUDENT: 'student', TEACHER: 'teacher', SUPER_ADMIN: 'super_admin' };
const mapGroup = (row: any): ChatGroup => ({
  id: row.id, name: row.name, createdBy: row.createdById, createdByName: row.createdBy?.name ?? '',
  memberIds: (row.members ?? []).map((item: any) => item.user?.id ?? item.userId),
  members: (row.members ?? []).map((item: any) => ({ id: item.user?.id ?? item.userId, name: item.user?.name ?? '', role: roles[item.user?.role] ?? 'student', avatar: item.user?.avatar ?? undefined })),
  createdAt: new Date(row.createdAt),
  lastMessage: row.lastMessage?.content,
  lastMessageAt: row.lastMessage?.createdAt ? new Date(row.lastMessage.createdAt) : undefined,
});
const mapMessage = (row: any): Message => ({ id: row.id, groupId: row.groupId, senderId: row.senderId, senderName: row.sender?.name ?? '', senderRole: roles[row.sender?.role] ?? 'student', content: row.content, createdAt: new Date(row.createdAt) });
const mapNotification = (row: any): Notification => ({ ...row, type: String(row.type).toLowerCase() as Notification['type'], createdAt: new Date(row.createdAt) });

export function MessagingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) { setChatGroups([]); setMessages({}); setNotifications([]); return; }
    Promise.all([messagingApi.listGroups(), notificationApi.list()]).then(([groups, notifs]) => {
      const mappedGroups = (groups.data ?? []).map(mapGroup);
      setChatGroups(mappedGroups);
      setNotifications((notifs.data ?? []).map(mapNotification));
      return Promise.all(mappedGroups.map(async group => {
        const response = await messagingApi.listMessages(group.id);
        return [group.id, (response.data ?? []).map(mapMessage)] as const;
      }));
    }).then(entries => { if (entries) setMessages(Object.fromEntries(entries)); })
      .catch(error => toast.error(error.message || 'Could not load messages'));
  }, [user]);

  const createGroup = async (name: string, memberIds: string[]) => {
    try {
      const response = await messagingApi.createGroup(name, memberIds);
      if (!response.data) return null;
      const group = mapGroup(response.data);
      setChatGroups(prev => [group, ...prev]); setMessages(prev => ({ ...prev, [group.id]: [] }));
      return group;
    } catch (error: any) { toast.error(error.message || 'Could not create chat group'); return null; }
  };

  const sendMessage = async (groupId: string, content: string) => {
    if (!content.trim()) return;
    try {
      const response = await messagingApi.sendMessage(groupId, content.trim());
      if (!response.data) return;
      const message = mapMessage(response.data);
      setMessages(prev => ({ ...prev, [groupId]: [...(prev[groupId] ?? []), message] }));
      setChatGroups(prev => prev.map(group => group.id === groupId ? { ...group, lastMessage: message.content, lastMessageAt: message.createdAt } : group));
      const updatedNotifications = await notificationApi.list();
      setNotifications((updatedNotifications.data ?? []).map(mapNotification));
    } catch (error: any) { toast.error(error.message || 'Could not send message'); }
  };

  const markNotificationAsRead = async (id: string) => {
    try { await notificationApi.markRead(id); setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n)); }
    catch (error: any) { toast.error(error.message || 'Could not update notification'); }
  };
  const clearAllNotifications = async () => {
    try { await notificationApi.markAllRead(); setNotifications(prev => prev.map(n => ({ ...n, isRead: true }))); }
    catch (error: any) { toast.error(error.message || 'Could not update notifications'); }
  };
  const getUnreadNotificationCount = () => notifications.filter(n => !n.isRead).length;

  return <MessagingContext.Provider value={{ chatGroups, messages, notifications, createGroup, sendMessage, markNotificationAsRead, getUnreadNotificationCount, clearAllNotifications }}>{children}</MessagingContext.Provider>;
}

export function useMessaging() {
  const context = useContext(MessagingContext);
  if (!context) throw new Error('useMessaging must be used within a MessagingProvider');
  return context;
}
