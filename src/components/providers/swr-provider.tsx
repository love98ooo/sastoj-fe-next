'use client';

import { SWRConfig } from 'swr';
import { ReactNode } from 'react';

interface SWRProviderProps {
  children: ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        refreshInterval: 0, // Disable auto-refresh by default
        revalidateOnFocus: false, // Don't revalidate when window gets focus
        dedupingInterval: 2000, // Dedup requests within 2 seconds
        errorRetryCount: 3, // Retry failed requests 3 times
        errorRetryInterval: 1000, // Wait 1 second between retries
        onError: () => {
          // Handle SWR errors silently or with proper error handling
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
