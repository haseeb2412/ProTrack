import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import TeachersView from '@/components/admin/TeachersView';
import CreateGroupsView from '@/components/admin/CreateGroupsView';
import GroupsEvaluationView from '@/components/admin/GroupsEvaluationView';
import AccountSettingsView from '@/components/shared/AccountSettingsView';
import { Settings, Users, UsersRound, BarChart3 } from 'lucide-react';

const navItems = [
  { label: 'See All Teachers', path: '/dashboard/super-admin/teachers', icon: Users },
  { label: 'Create Groups', path: '/dashboard/super-admin/groups', icon: UsersRound },
  { label: 'Groups Evaluation', path: '/dashboard/super-admin/evaluation', icon: BarChart3 },
  { label: 'Account Settings', path: '/dashboard/super-admin/settings', icon: Settings },
];

export default function SuperAdminDashboard() {
  return (
    <DashboardLayout navItems={navItems}>
      <Routes>
        <Route index element={<Navigate to="teachers" replace />} />
        <Route path="teachers" element={<TeachersView />} />
        <Route path="groups" element={<CreateGroupsView />} />
        <Route path="evaluation" element={<GroupsEvaluationView />} />
        <Route path="settings" element={<AccountSettingsView />} />
      </Routes>
    </DashboardLayout>
  );
}
