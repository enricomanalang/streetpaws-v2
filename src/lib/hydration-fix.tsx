'use client';

import { useEffect } from 'react';
import { fixHydrationErrors, observeForExtensionAttributes } from './hydration-error-fix';

// Fix for browser extension hydration mismatches
export function useHydrationFix() {
  useEffect(() => {
    // Fix hydration errors immediately
    fixHydrationErrors();
    
    // Set up observer for dynamically added elements
    const cleanup = observeForExtensionAttributes();

    return cleanup;
  }, []);
}

// Component wrapper for hydration-sensitive content
export function HydrationBoundary({ children }: { children: React.ReactNode }) {
  useHydrationFix();
  return <>{children}</>;
}


