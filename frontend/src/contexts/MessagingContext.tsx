import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ChatGroup, Message, Notification, UserRole } from '@/types';
import { useAuth } from './AuthContext';

interface MessagingContextType {
  chatGroups: ChatGroup[];
  messages: Record<string, Message[]>;
  notifications: Notification[];
  createGroup: (name: string, memberIds: string[]) => ChatGroup | null;
  sendMessage: (groupId: string, content: string) => void;
  addMembersToGroup: (groupId: string, memberIds: string[]) => void;
  markNotificationAsRead: (notificationId: string) => void;
  getUnreadNotificationCount: () => number;
  clearAllNotifications: () => void;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export function MessagingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Initialize demo data for demo users
  const initializeDemoData = (userId: string) => {
    const demoGroups: ChatGroup[] = [];
    const demoMessages: Record<string, Message[]> = {};
    
    // Demo Group 1: FYP Discussion Group
    const group1: ChatGroup = {
      id: 'demo-chat-001',
      name: 'FYP Discussion Group',
      createdBy: 's-001',
      createdByName: 'Alex Johnson',
      memberIds: ['s-001', 's-002', 's-003', 't-001'],
      members: [
        { id: 's-001', name: 'Alex Johnson', role: 'student' as UserRole },
        { id: 's-002', name: 'Emma Williams', role: 'student' as UserRole },
        { id: 's-003', name: 'Ryan Martinez', role: 'student' as UserRole },
        { id: 't-001', name: 'Prof. Sarah Wilson', role: 'teacher' as UserRole },
      ],
      createdAt: new Date(Date.now() - 86400000 * 5), // 5 days ago
      lastMessage: 'Great work on the proposal!',
      lastMessageAt: new Date(Date.now() - 3600000), // 1 hour ago
    };
    
    demoGroups.push(group1);
    demoMessages['demo-chat-001'] = [
      {
        id: 'msg-001',
        groupId: 'demo-chat-001',
        senderId: 's-001',
        senderName: 'Alex Johnson',
        senderRole: 'student',
        content: 'Hey everyone! Let\'s discuss our project timeline.',
        createdAt: new Date(Date.now() - 86400000 * 5),
      },
      {
        id: 'msg-002',
        groupId: 'demo-chat-001',
        senderId: 's-002',
        senderName: 'Emma Williams',
        senderRole: 'student',
        content: 'I think we should finish the documentation by next week.',
        createdAt: new Date(Date.now() - 86400000 * 4),
      },
      {
        id: 'msg-003',
        groupId: 'demo-chat-001',
        senderId: 't-001',
        senderName: 'Prof. Sarah Wilson',
        senderRole: 'teacher',
        content: 'That sounds good. Make sure to include all the required sections.',
        createdAt: new Date(Date.now() - 86400000 * 3),
      },
      {
        id: 'msg-004',
        groupId: 'demo-chat-001',
        senderId: 's-003',
        senderName: 'Ryan Martinez',
        senderRole: 'student',
        content: 'I\'ll work on the API documentation part.',
        createdAt: new Date(Date.now() - 86400000 * 2),
      },
      {
        id: 'msg-005',
        groupId: 'demo-chat-001',
        senderId: 't-001',
        senderName: 'Prof. Sarah Wilson',
        senderRole: 'teacher',
        content: 'Great work on the proposal!',
        createdAt: new Date(Date.now() - 3600000),
      },
    ];

    // Demo Group 2: Study Group
    const group2: ChatGroup = {
      id: 'demo-chat-002',
      name: 'Study Group - Team Alpha',
      createdBy: 's-001',
      createdByName: 'Alex Johnson',
      memberIds: ['s-001', 's-004', 's-005', 's-006'],
      members: [
        { id: 's-001', name: 'Alex Johnson', role: 'student' as UserRole },
        { id: 's-004', name: 'Sophie Anderson', role: 'student' as UserRole },
        { id: 's-005', name: 'David Lee', role: 'student' as UserRole },
        { id: 's-006', name: 'Olivia Taylor', role: 'student' as UserRole },
      ],
      createdAt: new Date(Date.now() - 86400000 * 7), // 7 days ago
      lastMessage: 'See you tomorrow!',
      lastMessageAt: new Date(Date.now() - 7200000), // 2 hours ago
    };
    
    demoGroups.push(group2);
    demoMessages['demo-chat-002'] = [
      {
        id: 'msg-006',
        groupId: 'demo-chat-002',
        senderId: 's-001',
        senderName: 'Alex Johnson',
        senderRole: 'student',
        content: 'Anyone available for a study session tomorrow?',
        createdAt: new Date(Date.now() - 86400000 * 3),
      },
      {
        id: 'msg-007',
        groupId: 'demo-chat-002',
        senderId: 's-004',
        senderName: 'Sophie Anderson',
        senderRole: 'student',
        content: 'I can join at 2 PM!',
        createdAt: new Date(Date.now() - 86400000 * 2),
      },
      {
        id: 'msg-008',
        groupId: 'demo-chat-002',
        senderId: 's-005',
        senderName: 'David Lee',
        senderRole: 'student',
        content: 'Same here, see you at 2 PM.',
        createdAt: new Date(Date.now() - 86400000 * 2),
      },
      {
        id: 'msg-009',
        groupId: 'demo-chat-002',
        senderId: 's-006',
        senderName: 'Olivia Taylor',
        senderRole: 'student',
        content: 'See you tomorrow!',
        createdAt: new Date(Date.now() - 7200000),
      },
    ];

    // Demo Group 3: Project Feedback
    if (userId === 't-001' || userId === 's-001' || userId === 's-002') {
      const group3: ChatGroup = {
        id: 'demo-chat-003',
        name: 'Project Feedback - Healthcare System',
        createdBy: 't-001',
        createdByName: 'Prof. Sarah Wilson',
        memberIds: ['t-001', 's-001', 's-002'],
        members: [
          { id: 't-001', name: 'Prof. Sarah Wilson', role: 'teacher' as UserRole },
          { id: 's-001', name: 'Alex Johnson', role: 'student' as UserRole },
          { id: 's-002', name: 'Emma Williams', role: 'student' as UserRole },
        ],
        createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
        lastMessage: 'Thank you professor!',
        lastMessageAt: new Date(Date.now() - 1800000), // 30 minutes ago
      };
      
      demoGroups.push(group3);
      demoMessages['demo-chat-003'] = [
        {
          id: 'msg-010',
          groupId: 'demo-chat-003',
          senderId: 't-001',
          senderName: 'Prof. Sarah Wilson',
          senderRole: 'teacher',
          content: 'Great progress on the project! The database schema looks solid.',
          createdAt: new Date(Date.now() - 86400000 * 2),
        },
        {
          id: 'msg-011',
          groupId: 'demo-chat-003',
          senderId: 's-001',
          senderName: 'Alex Johnson',
          senderRole: 'student',
          content: 'Thank you professor! We worked really hard on it.',
          createdAt: new Date(Date.now() - 86400000 * 1),
        },
        {
          id: 'msg-012',
          groupId: 'demo-chat-003',
          senderId: 's-002',
          senderName: 'Emma Williams',
          senderRole: 'student',
          content: 'Thank you professor!',
          createdAt: new Date(Date.now() - 1800000),
        },
      ];
    }

    // Initialize demo notifications
    const demoNotifications: Notification[] = [];
    
    if (userId === 's-001') {
      // Demo notifications for student
      demoNotifications.push(
        {
          id: 'notif-001',
          userId: 's-001',
          type: 'group_invite',
          message: 'Emma Williams added you to the group "Study Group - Team Alpha"',
          groupId: 'demo-chat-002',
          isRead: false,
          createdAt: new Date(Date.now() - 86400000 * 6),
        },
        {
          id: 'notif-002',
          userId: 's-001',
          type: 'message',
          message: 'Prof. Sarah Wilson: Great work on the proposal!',
          groupId: 'demo-chat-001',
          isRead: false,
          createdAt: new Date(Date.now() - 3600000),
        },
        {
          id: 'notif-003',
          userId: 's-001',
          type: 'message',
          message: 'Sophie Anderson: I can join at 2 PM!',
          groupId: 'demo-chat-002',
          isRead: true,
          createdAt: new Date(Date.now() - 86400000 * 2),
        },
        {
          id: 'notif-004',
          userId: 's-001',
          type: 'group_invite',
          message: 'Prof. Sarah Wilson added you to the group "Project Feedback - Healthcare System"',
          groupId: 'demo-chat-003',
          isRead: false,
          createdAt: new Date(Date.now() - 86400000 * 2),
        },
        {
          id: 'notif-005',
          userId: 's-001',
          type: 'message',
          message: 'Prof. Sarah Wilson: Great progress on the project! The database schema looks solid.',
          groupId: 'demo-chat-003',
          isRead: false,
          createdAt: new Date(Date.now() - 86400000 * 1),
        }
      );
    } else if (userId === 't-001') {
      // Demo notifications for teacher
      demoNotifications.push(
        {
          id: 'notif-006',
          userId: 't-001',
          type: 'message',
          message: 'Alex Johnson: Hey everyone! Let\'s discuss our project timeline.',
          groupId: 'demo-chat-001',
          isRead: true,
          createdAt: new Date(Date.now() - 86400000 * 5),
        },
        {
          id: 'notif-007',
          userId: 't-001',
          type: 'message',
          message: 'Emma Williams: I think we should finish the documentation by next week.',
          groupId: 'demo-chat-001',
          isRead: true,
          createdAt: new Date(Date.now() - 86400000 * 4),
        },
        {
          id: 'notif-008',
          userId: 't-001',
          type: 'message',
          message: 'Alex Johnson: Thank you professor! We worked really hard on it.',
          groupId: 'demo-chat-003',
          isRead: false,
          createdAt: new Date(Date.now() - 86400000 * 1),
        },
        {
          id: 'notif-009',
          userId: 't-001',
          type: 'task_update',
          message: 'Alex Johnson submitted a new task: "Database Schema Design"',
          isRead: false,
          createdAt: new Date(Date.now() - 1800000),
        }
      );
    }

    return { demoGroups, demoMessages, demoNotifications };
  };

  // Load data from localStorage on mount
  useEffect(() => {
    if (!user) return;

    const storedGroups = localStorage.getItem(`protrack_chat_groups_${user.id}`);
    const storedMessages = localStorage.getItem(`protrack_messages_${user.id}`);
    const storedNotifications = localStorage.getItem(`protrack_notifications_${user.id}`);

    // Check if demo data should be initialized (for demo users)
    const isDemoUser = ['s-001', 't-001'].includes(user.id);
    const hasNoData = !storedGroups || storedGroups === '[]';
    const hasNoNotifications = !storedNotifications || storedNotifications === '[]';

    if (storedGroups) {
      try {
        const parsed = JSON.parse(storedGroups);
        if (parsed.length > 0) {
          setChatGroups(parsed.map((g: any) => ({
            ...g,
            createdAt: new Date(g.createdAt),
            lastMessageAt: g.lastMessageAt ? new Date(g.lastMessageAt) : undefined,
          })));
        } else if (isDemoUser && hasNoData) {
          // Initialize demo data for demo users
          const { demoGroups, demoMessages, demoNotifications } = initializeDemoData(user.id);
          setChatGroups(demoGroups);
          setMessages(demoMessages);
          if (demoNotifications.length > 0) {
            setNotifications(demoNotifications);
          }
          localStorage.setItem(`protrack_chat_groups_${user.id}`, JSON.stringify(demoGroups));
          localStorage.setItem(`protrack_messages_${user.id}`, JSON.stringify(demoMessages));
          if (demoNotifications.length > 0) {
            localStorage.setItem(`protrack_notifications_${user.id}`, JSON.stringify(demoNotifications));
          }
        }
      } catch (e) {
        console.error('Error parsing chat groups:', e);
        if (isDemoUser) {
          const { demoGroups, demoMessages, demoNotifications } = initializeDemoData(user.id);
          setChatGroups(demoGroups);
          setMessages(demoMessages);
          if (demoNotifications.length > 0) {
            setNotifications(demoNotifications);
          }
        }
      }
    } else if (isDemoUser) {
      // No stored data, initialize demo data
      const { demoGroups, demoMessages, demoNotifications } = initializeDemoData(user.id);
      setChatGroups(demoGroups);
      setMessages(demoMessages);
      if (demoNotifications.length > 0) {
        setNotifications(demoNotifications);
      }
      localStorage.setItem(`protrack_chat_groups_${user.id}`, JSON.stringify(demoGroups));
      localStorage.setItem(`protrack_messages_${user.id}`, JSON.stringify(demoMessages));
      if (demoNotifications.length > 0) {
        localStorage.setItem(`protrack_notifications_${user.id}`, JSON.stringify(demoNotifications));
      }
    }

    if (storedMessages) {
      try {
        const parsed = JSON.parse(storedMessages);
        const parsedMessages: Record<string, Message[]> = {};
        Object.keys(parsed).forEach(groupId => {
          parsedMessages[groupId] = parsed[groupId].map((m: any) => ({
            ...m,
            createdAt: new Date(m.createdAt),
          }));
        });
        if (Object.keys(parsedMessages).length > 0) {
          setMessages(parsedMessages);
        }
      } catch (e) {
        console.error('Error parsing messages:', e);
      }
    }

    if (storedNotifications) {
      try {
        const parsed = JSON.parse(storedNotifications);
        if (parsed.length > 0) {
          setNotifications(parsed.map((n: any) => ({
            ...n,
            createdAt: new Date(n.createdAt),
          })));
        } else if (isDemoUser && hasNoNotifications) {
          // Initialize demo notifications if none exist
          const { demoNotifications } = initializeDemoData(user.id);
          if (demoNotifications.length > 0) {
            setNotifications(demoNotifications);
            localStorage.setItem(`protrack_notifications_${user.id}`, JSON.stringify(demoNotifications));
          }
        }
      } catch (e) {
        console.error('Error parsing notifications:', e);
        if (isDemoUser) {
          const { demoNotifications } = initializeDemoData(user.id);
          if (demoNotifications.length > 0) {
            setNotifications(demoNotifications);
          }
        }
      }
    } else if (isDemoUser) {
      // No stored notifications, initialize demo notifications
      const { demoNotifications } = initializeDemoData(user.id);
      if (demoNotifications.length > 0) {
        setNotifications(demoNotifications);
        localStorage.setItem(`protrack_notifications_${user.id}`, JSON.stringify(demoNotifications));
      }
    }
  }, [user]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`protrack_chat_groups_${user.id}`, JSON.stringify(chatGroups));
  }, [chatGroups, user]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`protrack_messages_${user.id}`, JSON.stringify(messages));
  }, [messages, user]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`protrack_notifications_${user.id}`, JSON.stringify(notifications));
  }, [notifications, user]);

  // Helper to get all users (students + teachers)
  const getAllUsers = () => {
    const usersStr = localStorage.getItem('protrack_users');
    const users = usersStr ? JSON.parse(usersStr) : [];
    return users;
  };

  const createGroup = (name: string, memberIds: string[]): ChatGroup | null => {
    if (!user) return null;

    const allUsers = getAllUsers();
    const members = memberIds.map(id => {
      const foundUser = allUsers.find((u: any) => u.id === id);
      if (foundUser) {
        return {
          id: foundUser.id,
          name: foundUser.name,
          role: foundUser.role,
          avatar: foundUser.avatar,
        };
      }
      return null;
    }).filter(Boolean) as { id: string; name: string; role: UserRole; avatar?: string }[];

    // Add creator to members if not already included
    if (!memberIds.includes(user.id)) {
      members.push({
        id: user.id,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      });
    }

    const newGroup: ChatGroup = {
      id: `chat-${Date.now()}`,
      name,
      createdBy: user.id,
      createdByName: user.name,
      memberIds: [...new Set([user.id, ...memberIds])],
      members,
      createdAt: new Date(),
    };

    setChatGroups(prev => [newGroup, ...prev]);
    setMessages(prev => ({ ...prev, [newGroup.id]: [] }));

    // Create notifications for all members except the creator
    const newNotifications: Notification[] = memberIds
      .filter(id => id !== user.id)
      .map(memberId => ({
        id: `notif-${Date.now()}-${memberId}`,
        userId: memberId,
        type: 'group_invite' as const,
        message: `${user.name} added you to the group "${name}"`,
        groupId: newGroup.id,
        isRead: false,
        createdAt: new Date(),
      }));

    setNotifications(prev => [...newNotifications, ...prev]);

    return newGroup;
  };

  const sendMessage = (groupId: string, content: string) => {
    if (!user || !content.trim()) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      groupId,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      content: content.trim(),
      createdAt: new Date(),
    };

    setMessages(prev => ({
      ...prev,
      [groupId]: [...(prev[groupId] || []), newMessage],
    }));

    // Update group's last message
    setChatGroups(prev =>
      prev.map(group =>
        group.id === groupId
          ? {
              ...group,
              lastMessage: content.trim(),
              lastMessageAt: new Date(),
            }
          : group
      )
    );

    // Create notifications for other members
    const group = chatGroups.find(g => g.id === groupId);
    if (group) {
      const otherMembers = group.memberIds.filter(id => id !== user.id);
      const newNotifications: Notification[] = otherMembers.map(memberId => ({
        id: `notif-${Date.now()}-${memberId}`,
        userId: memberId,
        type: 'message' as const,
        message: `${user.name}: ${content.trim().substring(0, 50)}${content.trim().length > 50 ? '...' : ''}`,
        groupId,
        isRead: false,
        createdAt: new Date(),
      }));

      setNotifications(prev => [...newNotifications, ...prev]);
    }
  };

  const addMembersToGroup = (groupId: string, memberIds: string[]) => {
    if (!user) return;

    const allUsers = getAllUsers();
    const newMembers = memberIds.map(id => {
      const foundUser = allUsers.find((u: any) => u.id === id);
      if (foundUser) {
        return {
          id: foundUser.id,
          name: foundUser.name,
          role: foundUser.role,
          avatar: foundUser.avatar,
        };
      }
      return null;
    }).filter(Boolean) as { id: string; name: string; role: UserRole; avatar?: string }[];

    setChatGroups(prev =>
      prev.map(group => {
        if (group.id === groupId) {
          const updatedMemberIds = [...new Set([...group.memberIds, ...memberIds])];
          const updatedMembers = [
            ...group.members,
            ...newMembers.filter(m => !group.members.find(existing => existing.id === m.id)),
          ];

          // Create notifications for newly added members
          const newNotifications: Notification[] = memberIds.map(memberId => ({
            id: `notif-${Date.now()}-${memberId}`,
            userId: memberId,
            type: 'group_invite' as const,
            message: `${user.name} added you to the group "${group.name}"`,
            groupId,
            isRead: false,
            createdAt: new Date(),
          }));

          setNotifications(prevNotifs => [...newNotifications, ...prevNotifs]);

          return {
            ...group,
            memberIds: updatedMemberIds,
            members: updatedMembers,
          };
        }
        return group;
      })
    );
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
  };

  const getUnreadNotificationCount = (): number => {
    if (!user) return 0;
    return notifications.filter(n => n.userId === user.id && !n.isRead).length;
  };

  const clearAllNotifications = () => {
    if (!user) return;
    setNotifications(prev => prev.map(n => (n.userId === user.id ? { ...n, isRead: true } : n)));
  };

  // Filter groups and messages to only show what the current user is part of
  const userGroups = chatGroups.filter(
    group => user && group.memberIds.includes(user.id)
  );
  const userMessages: Record<string, Message[]> = {};
  userGroups.forEach(group => {
    if (messages[group.id]) {
      userMessages[group.id] = messages[group.id];
    }
  });
  const userNotifications = notifications.filter(
    n => user && n.userId === user.id
  );

  return (
    <MessagingContext.Provider
      value={{
        chatGroups: userGroups,
        messages: userMessages,
        notifications: userNotifications,
        createGroup,
        sendMessage,
        addMembersToGroup,
        markNotificationAsRead,
        getUnreadNotificationCount,
        clearAllNotifications,
      }}
    >
      {children}
    </MessagingContext.Provider>
  );
}

export function useMessaging() {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
}

