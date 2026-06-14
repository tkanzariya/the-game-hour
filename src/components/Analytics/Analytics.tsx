import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { initClarity, trackClarityPageView } from '@/lib/analytics/clarity'

/** Production-only analytics: Microsoft Clarity + SPA route tracking. */
export default function Analytics() {
  const { pathname, search } = useLocation()
  const didInit = useRef(false)

  useEffect(() => {
    if (didInit.current) return
    didInit.current = true
    initClarity()
  }, [])

  useEffect(() => {
    const path = `${pathname}${search}`
    trackClarityPageView(path)
  }, [pathname, search])

  return null
}
