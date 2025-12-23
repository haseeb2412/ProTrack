import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import TeacherGroupsView from '@/components/teacher/TeacherGroupsView';
import TaskReviewView from '@/components/teacher/TaskReviewView';
import AccountSettingsView from '@/components/shared/AccountSettingsView';
import { Settings, UsersRound, ListTodo } from 'lucide-react';

const navItems = [
  { label: 'My Groups', path: '/dashboard/teacher/groups', icon: UsersRound },
  { label: 'Task Review', path: '/dashboard/teacher/tasks', icon: ListTodo },
  { label: 'Account Settings', path: '/dashboard/teacher/settings', icon: Settings },
];

export default function TeacherDashboard() {
  return (
    <DashboardLayout navItems={navItems}>
      <Routes>
        <Route index element={<Navigate to="groups" replace />} />
        <Route path="groups" element={<TeacherGroupsView />} />
        <Route path="tasks" element={<TaskReviewView />} />
        <Route path="settings" element={<AccountSettingsView />} />
      </Routes>
    </DashboardLayout>
  );
}
