'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

function getSystemTheme() {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialTheme() {
  if (typeof window === 'undefined') return THEMES.SYSTEM;
  const stored = localStorage.getItem('theme-preference');
  if (stored && Object.values(THEMES).includes(stored)) {
    return stored;
  }
  return THEMES.SYSTEM;
}

export function ThemeProvider({ children }) {
  const [themeMode, setThemeMode] = useState(getInitialTheme);
  const [actualTheme, setActualTheme] = useState(getSystemTheme());

  // Apply theme to document
  const applyTheme = useCallback((theme) => {
    if (typeof window === 'undefined') return;
    
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      // System theme - let CSS media query handle it
      root.classList.remove('light', 'dark');
    }
  }, []);

  // Update actual theme when system preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      if (themeMode === THEMES.SYSTEM) {
        const newTheme = e.matches ? 'dark' : 'light';
        setActualTheme(newTheme);
        applyTheme(newTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode, applyTheme]);

  // Apply theme whenever themeMode changes
  useEffect(() => {
    if (themeMode === THEMES.SYSTEM) {
      const systemTheme = getSystemTheme();
      setActualTheme(systemTheme);
      applyTheme(systemTheme);
    } else {
      setActualTheme(themeMode);
      applyTheme(themeMode);
    }

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme-preference', themeMode);
    }
  }, [themeMode, applyTheme]);

  const changeTheme = useCallback((newTheme) => {
    if (Object.values(THEMES).includes(newTheme)) {
      setThemeMode(newTheme);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    if (themeMode === THEMES.LIGHT) {
      setThemeMode(THEMES.DARK);
    } else if (themeMode === THEMES.DARK) {
      setThemeMode(THEMES.LIGHT);
    } else {
      // If system, toggle between light/dark based on current system
      const system = getSystemTheme();
      setThemeMode(system === 'dark' ? 'light' : 'dark');
    }
  }, [themeMode]);

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        actualTheme,
        changeTheme,
        toggleTheme,
        themes: THEMES,
        isDark: actualTheme === 'dark',
        isLight: actualTheme === 'light',
        isSystem: themeMode === THEMES.SYSTEM,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export { THEMES };
