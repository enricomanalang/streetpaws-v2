'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import Navigation from './Navigation';

export default function ConditionalNavigation() {
  const { profile, loading } = useAuth();
  const pathname = usePathname();

  // Don't show navigation on admin pages
  if (pathname.startsWith('/admin')) {
    return null;
  }

  // Don't show navigation while loading
  if (loading) {
    return null;
  }

  return <Navigation />;
}

