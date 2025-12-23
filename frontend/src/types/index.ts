// ProTrack Type Definitions

export type UserRole = 'super_admin' | 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  designation: string;
  avatar?: string;
  createdAt: Date;
}

export interface Teacher extends User {
  role: 'teacher';
  department: string;
  assignedGroups: string[];
}

export interface Student extends User {
  role: 'student';
  enrollmentId: string;
  groupId?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
}

export interface Group {
  id: string;
  name: string;
  projectId: string;
  projectName: string;
  teacherId: string;
  teacherName: string;
  studentIds: string[];
  students: Pick<Student, 'id' | 'name' | 'avatar'>[];
  createdAt: Date;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  studentId: string;
  studentName: string;
  groupId: string;
  fileUrl?: string;
  fileName?: string;
  status: 'pending' | 'approved' | 'needs_revision';
  comments: TaskComment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  createdAt: Date;
}

export interface GroupEvaluation {
  groupId: string;
  groupName: string;
  projectName: string;
  overallProgress: number;
  tasks: Task[];
  studentPerformance: {
    studentId: string;
    studentName: string;
    tasksCompleted: number;
    tasksApproved: number;
    tasksPending: number;
  }[];
}

// Chat and Messaging Types
export interface ChatGroup {
  id: string;
  name: string;
  createdBy: string;
  createdByName: string;
  memberIds: string[];
  members: { id: string; name: string; role: UserRole; avatar?: string }[];
  createdAt: Date;
  lastMessage?: string;
  lastMessageAt?: Date;
}

export interface Message {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'group_invite' | 'message' | 'task_update';
  message: string;
  groupId?: string;
  taskId?: string;
  isRead: boolean;
  createdAt: Date;
}