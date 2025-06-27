'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" disabled>
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const handleToggle = () => {
    if (theme === 'system') {
      // If currently system, switch based on resolved theme
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    } else {
      // If explicitly light or dark, toggle
      setTheme(theme === 'light' ? 'dark' : 'light');
    }
  };

  // Use resolvedTheme to show the correct icon when theme is 'system'
  const currentTheme = theme === 'system' ? resolvedTheme : theme;

  return (
    <Button variant="outline" size="icon" onClick={handleToggle}>
      {currentTheme === 'light' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
