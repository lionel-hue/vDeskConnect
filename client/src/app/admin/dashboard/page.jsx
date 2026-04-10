'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Users,
  CreditCard,
  TrendingUp,
  Activity,
  Globe,
  Shield,
  Package,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart3,
  PieChart,
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import IllustrationDisplay from '@/components/ui/IllustrationDisplay';
import { api } from '@/lib/api';

const STATS = [
  {
    label: 'Total Schools',
    value: '500+',
    change: '+12%',
    trend: 'up',
    icon: Building2,
    color: 'bg-primary/10 text-primary',
  },
  {
    label: 'Active Users',
    value: '12,847',
    change: '+8%',
    trend: 'up',
    icon: Users,
    color: 'bg-success/10 text-success',
  },
  {
    label: 'Revenue (Monthly)',
    value: '$48,250',
    change: '+23%',
    trend: 'up',
    icon: CreditCard,
    color: 'bg-warning/10 text-warning',
  },
  {
    label: 'Retention Rate',
    value: '98%',
    change: '+2%',
    trend: 'up',
    icon: TrendingUp,
    color: 'bg-info/10 text-info',
  },
];

const RECENT_SCHOOLS = [
  { name: 'Greenfield Academy', country: 'Nigeria', plan: 'Premium', status: 'active', date: '2026-04-08' },
  { name: 'Lycée Saint-Michel', country: 'France', plan: 'Standard', status: 'active', date: '2026-04-07' },
  { name: 'Bright Future School', country: 'Kenya', plan: 'Basic', status: 'trial', date: '2026-04-06' },
  { name: 'St. Mary\'s College', country: 'Ghana', plan: 'Enterprise', status: 'active', date: '2026-04-05' },
  { name: 'Collège Moderne', country: 'Benin', plan: 'Standard', status: 'trial', date: '2026-04-04' },
];

const SUBSCRIPTION_STATS = [
  { plan: 'Basic', count: 180, color: 'bg-info' },
  { plan: 'Standard', count: 210, color: 'bg-primary' },
  { plan: 'Premium', count: 85, color: 'bg-warning' },
  { plan: 'Enterprise', count: 25, color: 'bg-success' },
];

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(STATS);
  const [schools, setSchools] = useState(RECENT_SCHOOLS);

  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    // Fetch dashboard data
    api.get('/user')
      .then((data) => {
        if (data.user?.role !== 'super_admin') {
          router.push('/dashboard');
          return;
        }
        setLoading(false);
      })
      .catch(() => {
        api.logout();
        router.push('/login');
      });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <DashboardLayout title="Platform Overview" subtitle="Welcome back, Super Admin" role="super_admin">
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-hero p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Platform Analytics Dashboard</h2>
              <p className="text-white/80 text-sm">Monitor your platform's growth, schools, and subscriptions.</p>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2 bg-white/10 rounded-btn px-3 py-1.5 text-xs">
                  <Shield size={14} />
                  <span>Forever & All Unlocked Plan</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-btn px-3 py-1.5 text-xs">
                  <Zap size={14} />
                  <span>All features unlocked</span>
                </div>
              </div>
            </div>
            <IllustrationDisplay
              name="superadmin_dashboard_hero"
              alt="Platform overview"
              className="hidden lg:block w-48"
              fallback={
                <div className="hidden lg:flex w-48 h-32 bg-white/10 rounded-card items-center justify-center">
                  <Globe size={40} className="text-white/50" />
                </div>
              }
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="glass-stat animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center backdrop-blur-lg border border-white/10 ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  stat.trend === 'up' ? 'text-success' : 'text-error'
                }`}>
                  {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {stat.change}
                </div>
              </div>
              <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
              <p className="text-sm text-text-secondary mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Schools */}
          <div className="lg:col-span-2 glass-card">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-text-primary">Recent Schools</h3>
              <button className="text-sm text-primary hover:text-primary-dark transition-colors">
                View all
              </button>
            </div>
            <div className="divide-y divide-border">
              {schools.map((school, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-5 py-4 glass-row"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Building2 size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{school.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Globe size={12} className="text-text-muted" />
                        <span className="text-xs text-text-secondary">{school.country}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      school.status === 'active'
                        ? 'bg-success/10 text-success'
                        : 'bg-warning/10 text-warning'
                    }`}>
                      {school.plan}
                    </span>
                    <span className="text-xs text-text-muted">{school.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subscription Distribution */}
          <div className="glass-card">
            <div className="p-5 border-b border-border">
              <h3 className="font-semibold text-text-primary">Subscription Plans</h3>
              <p className="text-xs text-text-secondary mt-1">Distribution across all schools</p>
            </div>
            <div className="p-5 space-y-4">
              {SUBSCRIPTION_STATS.map((sub, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-text-secondary">{sub.plan}</span>
                    <span className="text-sm font-medium text-text-primary">{sub.count}</span>
                  </div>
                  <div className="h-2 bg-border rounded-full overflow-hidden">
                    <div
                      className={`h-full ${sub.color} rounded-full transition-all duration-500`}
                      style={{ width: `${(sub.count / 500) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-primary">Total Schools</span>
                  <span className="text-lg font-bold text-text-primary">500</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Glassmorphic */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-text-primary mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Manage Schools', icon: Building2, href: '/admin/schools', color: 'bg-primary/10 text-primary hover:bg-primary/20' },
              { label: 'Subscriptions', icon: CreditCard, href: '/admin/subscriptions', color: 'bg-warning/10 text-warning hover:bg-warning/20' },
              { label: 'Illustrations', icon: Package, href: '/admin/illustrations', color: 'bg-info/10 text-info hover:bg-info/20' },
              { label: 'Analytics', icon: BarChart3, href: '/admin/analytics', color: 'bg-success/10 text-success hover:bg-success/20' },
            ].map((action, i) => (
              <button
                key={i}
                onClick={() => router.push(action.href)}
                className={`flex flex-col items-center gap-3 p-4 rounded-card backdrop-blur-lg border border-white/10 ${action.color} transition-all duration-250 hover:scale-105`}
              >
                <action.icon size={24} />
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
