'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Ban,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Globe,
  CreditCard,
  Users,
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { api } from '@/lib/api';

const SCHOOLS = [
  { id: 1, name: 'Greenfield Academy', country: 'Nigeria', plan: 'Premium', status: 'active', users: 245, created: '2026-01-15', lastActive: '2026-04-09' },
  { id: 2, name: 'Lycée Saint-Michel', country: 'France', plan: 'Standard', status: 'active', users: 180, created: '2026-02-20', lastActive: '2026-04-08' },
  { id: 3, name: 'Bright Future School', country: 'Kenya', plan: 'Basic', status: 'trial', users: 52, created: '2026-04-06', lastActive: '2026-04-09' },
  { id: 4, name: 'St. Mary\'s College', country: 'Ghana', plan: 'Enterprise', status: 'active', users: 420, created: '2025-11-10', lastActive: '2026-04-07' },
  { id: 5, name: 'Collège Moderne', country: 'Benin', plan: 'Standard', status: 'trial', users: 38, created: '2026-04-04', lastActive: '2026-04-09' },
  { id: 6, name: 'Sunrise International', country: 'South Africa', plan: 'Premium', status: 'expired', users: 310, created: '2025-06-01', lastActive: '2026-03-15' },
  { id: 7, name: 'École Primaire du Centre', country: 'France', plan: 'Basic', status: 'active', users: 95, created: '2026-03-12', lastActive: '2026-04-08' },
  { id: 8, name: 'Heritage Academy', country: 'Nigeria', plan: 'Standard', status: 'active', users: 167, created: '2026-01-28', lastActive: '2026-04-09' },
];

const STATUS_FILTERS = ['All', 'Active', 'Trial', 'Expired'];
const PLAN_FILTERS = ['All', 'Basic', 'Standard', 'Premium', 'Enterprise'];

export default function SchoolsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [planFilter, setPlanFilter] = useState('All');
  const [schools, setSchools] = useState(SCHOOLS);
  const [selectedSchool, setSelectedSchool] = useState(null);

  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      router.push('/login');
      return;
    }

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

  const filteredSchools = schools.filter((school) => {
    const matchesSearch = school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || school.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesPlan = planFilter === 'All' || school.plan.toLowerCase() === planFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesPlan;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <DashboardLayout
      title="Schools"
      subtitle="Manage all registered schools on the platform"
      role="super_admin"
    >
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-bg-card rounded-card shadow-soft p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <CheckCircle size={20} className="text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {schools.filter((s) => s.status === 'active').length}
                </p>
                <p className="text-sm text-text-secondary">Active Schools</p>
              </div>
            </div>
          </div>
          <div className="bg-bg-card rounded-card shadow-soft p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                <Clock size={20} className="text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {schools.filter((s) => s.status === 'trial').length}
                </p>
                <p className="text-sm text-text-secondary">On Trial</p>
              </div>
            </div>
          </div>
          <div className="bg-bg-card rounded-card shadow-soft p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center">
                <XCircle size={20} className="text-error" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {schools.filter((s) => s.status === 'expired').length}
                </p>
                <p className="text-sm text-text-secondary">Expired</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-bg-card rounded-card shadow-soft p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search schools by name or country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-btn border border-border bg-bg-main text-sm text-text-primary placeholder-text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-text-muted" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 rounded-btn border border-border bg-bg-main text-sm text-text-primary outline-none focus:border-primary transition-all"
              >
                {STATUS_FILTERS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {/* Plan Filter */}
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-3 py-2.5 rounded-btn border border-border bg-bg-main text-sm text-text-primary outline-none focus:border-primary transition-all"
            >
              {PLAN_FILTERS.map((f) => (
                <option key={f} value={f}>{f === 'All' ? 'All Plans' : f}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Schools Table */}
        <div className="bg-bg-card rounded-card shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">School</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">Country</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">Plan</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">Users</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">Last Active</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSchools.map((school) => (
                  <tr key={school.id} className="hover:bg-bg-main/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 size={18} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">{school.name}</p>
                          <p className="text-xs text-text-muted">Created {school.created}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                        <Globe size={14} className="text-text-muted" />
                        {school.country}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        school.plan === 'Enterprise' ? 'bg-success/10 text-success' :
                        school.plan === 'Premium' ? 'bg-primary/10 text-primary' :
                        school.plan === 'Standard' ? 'bg-info/10 text-info' :
                        'bg-border text-text-secondary'
                      }`}>
                        {school.plan}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        school.status === 'active' ? 'bg-success/10 text-success' :
                        school.status === 'trial' ? 'bg-warning/10 text-warning' :
                        'bg-error/10 text-error'
                      }`}>
                        {school.status === 'active' && <CheckCircle size={12} />}
                        {school.status === 'trial' && <Clock size={12} />}
                        {school.status === 'expired' && <XCircle size={12} />}
                        {school.status.charAt(0).toUpperCase() + school.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                        <Users size={14} className="text-text-muted" />
                        {school.users}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-text-secondary">
                      {school.lastActive}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedSchool(school)}
                          className="p-2 rounded-lg hover:bg-bg-main text-text-muted hover:text-primary transition-all"
                          title="View details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="p-2 rounded-lg hover:bg-bg-main text-text-muted hover:text-error transition-all"
                          title="Ban school"
                        >
                          <Ban size={16} />
                        </button>
                        <button
                          className="p-2 rounded-lg hover:bg-bg-main text-text-muted hover:text-error transition-all"
                          title="Delete school"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-border">
            <p className="text-sm text-text-secondary">
              Showing {filteredSchools.length} of {schools.length} schools
            </p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 rounded-btn border border-border text-sm text-text-secondary hover:bg-bg-main transition-colors disabled:opacity-50" disabled>
                Previous
              </button>
              <button className="px-3 py-1.5 rounded-btn bg-primary text-white text-sm">1</button>
              <button className="px-3 py-1.5 rounded-btn border border-border text-sm text-text-secondary hover:bg-bg-main transition-colors">
                2
              </button>
              <button className="px-3 py-1.5 rounded-btn border border-border text-sm text-text-secondary hover:bg-bg-main transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>

        {/* School Detail Modal */}
        {selectedSchool && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedSchool(null)}>
            <div className="bg-bg-card rounded-card shadow-elevated max-w-lg w-full p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-text-primary">{selectedSchool.name}</h3>
                <button onClick={() => setSelectedSchool(null)} className="text-text-muted hover:text-text-primary">
                  ✕
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-text-secondary">Country</span>
                  <span className="text-sm font-medium text-text-primary">{selectedSchool.country}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-text-secondary">Plan</span>
                  <span className="text-sm font-medium text-text-primary">{selectedSchool.plan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-text-secondary">Status</span>
                  <span className="text-sm font-medium text-text-primary capitalize">{selectedSchool.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-text-secondary">Total Users</span>
                  <span className="text-sm font-medium text-text-primary">{selectedSchool.users}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-text-secondary">Created</span>
                  <span className="text-sm font-medium text-text-primary">{selectedSchool.created}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-text-secondary">Last Active</span>
                  <span className="text-sm font-medium text-text-primary">{selectedSchool.lastActive}</span>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button className="flex-1 px-4 py-2.5 rounded-btn bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors">
                  View Full Details
                </button>
                <button className="px-4 py-2.5 rounded-btn border border-border text-sm font-medium text-text-secondary hover:bg-bg-main transition-colors" onClick={() => setSelectedSchool(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
