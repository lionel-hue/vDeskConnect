'use client';

import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function SubscriptionsPage() {
  return (
    <DashboardLayout title="Subscriptions" subtitle="Manage subscription plans for all schools" role="super_admin">
      <div className="bg-bg-card rounded-card shadow-soft p-12 text-center">
        <p className="text-text-secondary">Subscription management coming soon.</p>
      </div>
    </DashboardLayout>
  );
}
