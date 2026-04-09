'use client';

import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function AnalyticsPage() {
  return (
    <DashboardLayout title="Analytics" subtitle="Platform-wide analytics and insights" role="super_admin">
      <div className="bg-bg-card rounded-card shadow-soft p-12 text-center">
        <p className="text-text-secondary">Advanced analytics coming soon.</p>
      </div>
    </DashboardLayout>
  );
}
