'use client';

import { useAnalytics } from '@/hooks/useAnalytics';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
  useAnalytics();

  return <>{children}</>;
};

export default AnalyticsProvider;