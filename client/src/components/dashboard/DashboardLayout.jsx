'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { api } from '@/lib/api';

export default function DashboardLayout({ children, title, subtitle, role = 'admin' }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    api.get('/user')
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        api.logout();
        router.push('/login');
      });
  }, [router]);

  const handleLogout = () => {
    api.logout();
    router.push('/login');
  };

  const handleSidebarToggle = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-main relative overflow-hidden">
      {/* Background gradient for glass effect */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-primary-light/5" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-light/10 rounded-full blur-3xl translate-y-1/2" />
      
      <Sidebar
        role={role}
        user={user}
        onLogout={handleLogout}
        onToggle={handleSidebarToggle}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <TopBar title={title} subtitle={subtitle} user={user} onMobileMenuToggle={handleMobileMenuToggle} />
        <main className="p-6 relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
