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

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-main">
      <Sidebar
        role={role}
        user={user}
        onLogout={handleLogout}
      />
      <div className="lg:ml-64 transition-all duration-300">
        <TopBar title={title} subtitle={subtitle} user={user} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
