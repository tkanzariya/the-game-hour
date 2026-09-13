import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { fetchSession, loginOps, logoutOps } from './api'
import type { OpsUser } from './types'

type OpsAuthValue = {
  user: OpsUser | null
  csrf: string
  loading: boolean
  login: (username: string, password: string) => Promise<string | null>
  logout: () => Promise<void>
}

const OpsAuthContext = createContext<OpsAuthValue | null>(null)

export function OpsAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<OpsUser | null>(null)
  const [csrf, setCsrf] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchSession()
      .then((session) => {
        if (cancelled) return
        setUser(session.user)
        setCsrf(session.csrf)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const session = await loginOps(username, password)
    if (!session.ok || !session.user) {
      return session.error ?? 'Could not sign in.'
    }
    setUser(session.user)
    setCsrf(session.csrf)
    return null
  }, [])

  const logout = useCallback(async () => {
    await logoutOps()
    setUser(null)
    setCsrf('')
  }, [])

  const value = useMemo(
    () => ({ user, csrf, loading, login, logout }),
    [user, csrf, loading, login, logout],
  )

  return <OpsAuthContext.Provider value={value}>{children}</OpsAuthContext.Provider>
}

export function useOpsAuth(): OpsAuthValue {
  const ctx = useContext(OpsAuthContext)
  if (!ctx) {
    throw new Error('useOpsAuth must be used within OpsAuthProvider')
  }
  return ctx
}
