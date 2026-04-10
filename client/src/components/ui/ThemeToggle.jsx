'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeProvider';
import { Sun, Moon, Monitor } from 'lucide-react';

export default function ThemeToggle({ className = '' }) {
  const { themeMode, changeTheme, themes, isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && !e.target.closest('.theme-dropdown')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  const themeOptions = [
    { value: themes.LIGHT, icon: Sun, label: 'Light', shortcut: '⌘L' },
    { value: themes.DARK, icon: Moon, label: 'Dark', shortcut: '⌘D' },
    { value: themes.SYSTEM, icon: Monitor, label: 'System', shortcut: '⌘S' },
  ];

  const currentTheme = themeOptions.find(t => t.value === themeMode);
  const CurrentIcon = currentTheme?.icon || Monitor;

  return (
    <div className={`relative theme-dropdown ${className}`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-btn
          transition-all duration-250 ease
          hover:scale-105
          ${isDark 
            ? 'bg-white/10 hover:bg-white/15 border border-white/20 text-white' 
            : 'bg-bg-card hover:bg-bg-main border border-border text-text-primary shadow-soft'
          }
        `}
        aria-label="Toggle theme"
        aria-expanded={isOpen}
      >
        <CurrentIcon size={18} />
        <span className="text-sm font-medium hidden sm:inline">{currentTheme?.label}</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`
            absolute top-full right-0 mt-2 py-2 min-w-[180px]
            rounded-card shadow-elevated
            border backdrop-blur-xl
            animate-scale-in
            z-50
            ${isDark 
              ? 'bg-gray-900/95 border-white/20' 
              : 'bg-bg-card/95 border-border'
            }
          `}
          role="menu"
        >
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isActive = themeMode === option.value;
            
            return (
              <button
                key={option.value}
                onClick={() => {
                  changeTheme(option.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-4 py-2.5
                  transition-all duration-200
                  ${isActive 
                    ? isDark 
                      ? 'bg-white/10 text-white' 
                      : 'bg-primary/10 text-primary'
                    : isDark
                      ? 'text-gray-300 hover:bg-white/5'
                      : 'text-text-primary hover:bg-bg-main'
                  }
                `}
                role="menuitem"
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} />
                  <span className="text-sm font-medium">{option.label}</span>
                </div>
                {isActive && (
                  <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-primary-light' : 'bg-primary'}`} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
