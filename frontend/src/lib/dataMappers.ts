import type { Group, Task, TaskComment, UserRole } from '@/types';

const roleMap: Record<string, UserRole> = { STUDENT: 'student', TEACHER: 'teacher', SUPER_ADMIN: 'super_admin' };

export function mapGroup(row: any): Group {
  return {
    id: row.id,
    name: row.name,
    projectId: row.projectId,
    projectName: row.project?.name ?? '',
    teacherId: row.teacher?.user?.id ?? row.teacherId,
    teacherName: row.teacher?.user?.name ?? '',
    studentIds: (row.students ?? []).map((student: any) => student.user?.id ?? student.userId),
    students: (row.students ?? []).map((student: any) => ({
      id: student.user?.id ?? student.userId,
      name: student.user?.name ?? '',
      avatar: student.user?.avatar ?? undefined,
      enrollmentId: student.enrollmentId ?? undefined,
    })),
    createdAt: new Date(row.createdAt),
  };
}

export function mapTask(row: any): Task {
  const comments: TaskComment[] = (row.comments ?? []).map((comment: any) => ({
    id: comment.id,
    taskId: comment.taskId,
    authorId: comment.authorId,
    authorName: comment.author?.name ?? '',
    authorRole: roleMap[comment.author?.role] ?? 'teacher',
    content: comment.content,
    createdAt: new Date(comment.createdAt),
  }));
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    studentId: row.student?.user?.id ?? row.student?.userId,
    studentName: row.student?.user?.name ?? '',
    groupId: row.groupId,
    fileUrl: row.fileUrl ?? undefined,
    fileName: row.fileName ?? undefined,
    status: String(row.status).toLowerCase() as Task['status'],
    comments,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  };
}

export function mapUser(row: any) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: roleMap[row.role] ?? row.role,
    designation: row.designation ?? '',
    avatar: row.avatar ?? undefined,
    createdAt: new Date(row.createdAt),
    department: row.teacherProfile?.department ?? '',
    enrollmentId: row.studentProfile?.enrollmentId ?? '',
    groupId: row.studentProfile?.group?.id,
  };
}
