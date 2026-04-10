'use client';

import { Bell, Search, User, Settings, Menu } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function TopBar({ title, subtitle, user, onMobileMenuToggle }) {
  return (
    <header className="sticky top-0 z-30 glass-header px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Title + Mobile Menu */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-primary/10 transition-colors"
          >
            <Menu size={20} className="text-text-secondary" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-text-primary">{title}</h1>
            {subtitle && <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {/* Search - Glass Input */}
          <div className="hidden md:flex items-center gap-2 glass-input rounded-btn px-3 py-2 w-64">
            <Search size={16} className="text-text-muted flex-shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm text-text-primary placeholder-text-muted outline-none flex-1"
            />
          </div>

          {/* Notifications */}
          <button className="relative w-10 h-10 flex items-center justify-center rounded-btn hover:bg-primary/10 transition-colors duration-200">
            <Bell size={20} className="text-text-secondary" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-error rounded-full border-2 border-bg-card" />
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User avatar */}
          <div className="flex items-center gap-3 pl-4 border-l border-border">
            <div className="w-9 h-9 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold text-primary border-2 border-primary/30 backdrop-blur-lg">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-text-primary">{user?.name || user?.email?.split('@')[0]}</p>
              <p className="text-xs text-text-muted">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
