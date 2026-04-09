'use client';

import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function AdminSettingsPage() {
  return (
    <DashboardLayout title="Settings" subtitle="Platform configuration" role="super_admin">
      <div className="bg-bg-card rounded-card shadow-soft p-12 text-center">
        <p className="text-text-secondary">Platform settings coming soon.</p>
      </div>
    </DashboardLayout>
  );
}
