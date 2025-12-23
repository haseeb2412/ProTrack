import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import StudentTasksView from '@/components/student/StudentTasksView';
import AccountSettingsView from '@/components/shared/AccountSettingsView';
import { Settings, ListTodo } from 'lucide-react';

const navItems = [
  { label: 'My Tasks', path: '/dashboard/student/tasks', icon: ListTodo },
  { label: 'Account Settings', path: '/dashboard/student/settings', icon: Settings },
];

export default function StudentDashboard() {
  return (
    <DashboardLayout navItems={navItems}>
      <Routes>
        <Route index element={<Navigate to="tasks" replace />} />
        <Route path="tasks" element={<StudentTasksView />} />
        <Route path="settings" element={<AccountSettingsView />} />
      </Routes>
    </DashboardLayout>
  );
}
