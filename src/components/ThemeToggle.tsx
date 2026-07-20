'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <span className="sr-only">Toggle Theme</span>
        <div className="w-5 h-5 bg-transparent" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
      aria-label="Toggle Theme"
    >
      <Sun className="h-5 w-5 absolute transition-all scale-100 rotate-0 dark:scale-0 dark:rotate-90 text-foreground/90" />
      <Moon className="h-5 w-5 absolute transition-all scale-0 -rotate-90 dark:scale-100 dark:rotate-0 text-foreground/90" />
    </button>
  );
}
