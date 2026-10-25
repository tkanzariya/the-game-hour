import { useEffect, useState } from 'react'
import { clockOffsetMs } from './inquiry'

/** Milliseconds until an ISO timestamp, kept in step with the server clock. */
export function useMsLeft(expiresAt: string, serverTime: string): number {
  const [offset] = useState(() => clockOffsetMs(serverTime))
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 15000)
    return () => window.clearInterval(timer)
  }, [])

  return new Date(expiresAt).getTime() - (now + offset)
}
