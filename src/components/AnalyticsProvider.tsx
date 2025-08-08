'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackPageVisit } from '@/lib/analytics'

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    // Track page visit on route change
    const trackVisit = async () => {
      try {
        // Get client IP from a separate API endpoint
        const ipResponse = await fetch('/api/get-ip')
        const { ip } = await ipResponse.json()
        
        await trackPageVisit(pathname, navigator.userAgent, ip)
      } catch (error) {
        // Fallback: track without IP
        await trackPageVisit(pathname, navigator.userAgent)
      }
    }

    trackVisit()
  }, [pathname])

  return <>{children}</>
}