'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import Image from 'next/image';

interface LogoProps {
  width?: number;
  height?: number;
  alt?: string;
  className?: string;
}

export function Logo({ width = 48, height = 48, alt = 'SASTOJ Logo', className }: LogoProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show a placeholder during hydration to avoid mismatch
  if (!mounted) {
    return (
      <div className={`bg-muted animate-pulse rounded ${className}`} style={{ width, height }} />
    );
  }

  // Determine which logo to use based on the current theme
  const currentTheme = theme === 'system' ? resolvedTheme : theme;
  const logoSrc = currentTheme === 'dark' ? '/sastoj-dark.svg' : '/sastoj.svg';

  return (
    <Image src={logoSrc} alt={alt} width={width} height={height} className={className} priority />
  );
}
