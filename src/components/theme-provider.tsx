'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

type Theme = 'light' | 'dark';
type ThemeContextValue = { theme: Theme; toggleTheme: () => void };
const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = 'onlyducks-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') setTheme(saved);
    } catch {
      // Keep the accessible light default when browser storage is unavailable.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Theme still works for the current page session.
    }
  }, [theme, ready]);

  const value = useMemo(() => ({
    theme,
    toggleTheme: () => setTheme((current) => current === 'light' ? 'dark' : 'light'),
  }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
      <button
        className="od-global-theme-toggle"
        type="button"
        onClick={value.toggleTheme}
        aria-label={theme === 'light' ? 'Switch to electronic dark theme' : 'Switch to marine blue light theme'}
        title={theme === 'light' ? 'Electronic dark' : 'Marine blue on white'}
      >
        <span aria-hidden="true">{theme === 'light' ? '☾' : '☀'}</span>
        {theme === 'light' ? 'Dark' : 'Light'}
      </button>
    </ThemeContext.Provider>
  );
}

export function useOnlyDucksTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useOnlyDucksTheme must be used within ThemeProvider');
  return context;
}
