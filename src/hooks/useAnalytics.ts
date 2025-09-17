'use client';

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { trackPageView } from '@/lib/api/analyticsApi'

export const useAnalytics = () => {
  const pathname = usePathname()
  const previousLocation = useRef<string>('')

  useEffect(() => {
    trackPageView(pathname)

    previousLocation.current = pathname
  }, [pathname])

  return {
    trackPageView,
  }
}