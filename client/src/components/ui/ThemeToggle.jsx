'use client';

import { useTheme } from '@/contexts/ThemeProvider';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeToggle({ className = '' }) {
  const { themeMode, changeTheme, themes, isDark } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only track whether we've mounted (for dark/light visual styling)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Safe dark/light value: false during SSR to prevent hydration mismatch
  const resolvedDark = mounted ? isDark : false;

  const options = [
    { value: themes.LIGHT, icon: Sun },
    { value: themes.SYSTEM, icon: Monitor },
    { value: themes.DARK, icon: Moon },
  ];

  // Use themeMode directly for active indicator — it's always correct after hydration
  // During SSR, isActive will be false for all (themeMode starts as 'system' on server)
  // which matches the server-rendered output
  const isActive = (option) => mounted && themeMode === option.value;

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          flex items-center gap-0.5 p-0.5 rounded-full
          backdrop-blur-lg border
          transition-all duration-300
          ${resolvedDark
            ? 'bg-white/10 border-white/20'
            : 'bg-white/50 border-white/30'
          }
        `}
        role="radiogroup"
        aria-label="Theme selection"
      >
        {options.map((option) => {
          const Icon = option.icon;
          const active = isActive(option);

          return (
            <button
              key={option.value}
              onClick={() => changeTheme(option.value)}
              className={`
                relative flex items-center justify-center
                w-6 h-6 sm:w-8 sm:h-8 rounded-full
                transition-all duration-250 ease-out
                hover:scale-110 active:scale-95
                ${active
                  ? resolvedDark
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'bg-white/80 text-text-primary shadow-sm'
                  : resolvedDark
                    ? 'text-white/50 hover:text-white/70'
                    : 'text-text-muted hover:text-text-secondary'
                }
              `}
              role="radio"
              aria-checked={active}
              aria-label={`${option.value} theme`}
            >
              <Icon size={12} className="sm:w-3.5 sm:h-3.5" />
              <span
                className={`
                  absolute -bottom-0.5 left-1/2 -translate-x-1/2
                  w-1 h-1 rounded-full
                  transition-opacity duration-200
                  ${active
                    ? (resolvedDark ? 'bg-primary-light opacity-100' : 'bg-primary opacity-100')
                    : 'opacity-0'
                  }
                `}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
