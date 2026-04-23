import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

export const ACCENTS = [
  { id: 'blue',    label: 'Ocean Blue',  color: '#0096E6', gradient: 'linear-gradient(135deg,#0096E6,#29A8EF)' },
  { id: 'red',     label: 'Ruby Red',    color: '#EF4444', gradient: 'linear-gradient(135deg,#DC2626,#EF4444)' },
  { id: 'purple',  label: 'Royal Purple',color: '#818CF8', gradient: 'linear-gradient(135deg,#6366F1,#818CF8)' },
  { id: 'teal',    label: 'Emerald Teal',color: '#10B981', gradient: 'linear-gradient(135deg,#059669,#10B981)' },
  { id: 'magenta', label: 'Hot Magenta', color: '#EC4899', gradient: 'linear-gradient(135deg,#DB2777,#EC4899)' },
  { id: 'orange',  label: 'Peach Orange',color: '#F97316', gradient: 'linear-gradient(135deg,#EA580C,#FB923C)' },
];

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(
    () => localStorage.getItem('app_theme') === 'dark'
  );
  const [accent, setAccentState] = useState(
    () => localStorage.getItem('app_accent') || 'blue'
  );

  const toggle = useCallback(() => {
    setDark(d => {
      const next = !d;
      localStorage.setItem('app_theme', next ? 'dark' : 'light');
      return next;
    });
  }, []);

  const setAccent = useCallback((id) => {
    localStorage.setItem('app_accent', id);
    setAccentState(id);
  }, []);

  // Apply data-theme and data-accent on <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accent);
  }, [accent]);

  return (
    <ThemeContext.Provider value={{ dark, toggle, accent, setAccent, ACCENTS }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
