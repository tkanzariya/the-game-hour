import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  getCmsContentPayload,
  isCmsContentReachable,
  loadCmsContent,
  type CmsContentPayload,
} from '@/lib/cms-content'

type CmsContentContextValue = {
  loaded: boolean
  reachable: boolean
  content: CmsContentPayload | null
  refresh: () => Promise<void>
}

const CmsContentContext = createContext<CmsContentContextValue | null>(null)

export function CmsContentProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState(isCmsContentReachable())
  const [reachable, setReachable] = useState(isCmsContentReachable())
  const [content, setContent] = useState<CmsContentPayload | null>(getCmsContentPayload())
  const [contentEpoch, setContentEpoch] = useState(0)

  const refresh = async (): Promise<void> => {
    const next = await loadCmsContent(true)
    setContent(next)
    setReachable(isCmsContentReachable())
    setLoaded(true)
    setContentEpoch((n) => n + 1)
  }

  useEffect(() => {
    void refresh()
  }, [])

  return (
    <CmsContentContext.Provider value={{ loaded, reachable, content, refresh }}>
      <div key={contentEpoch}>{children}</div>
    </CmsContentContext.Provider>
  )
}

export function useCmsContent(): CmsContentContextValue {
  const ctx = useContext(CmsContentContext)
  if (!ctx) {
    return {
      loaded: isCmsContentReachable(),
      reachable: isCmsContentReachable(),
      content: getCmsContentPayload(),
      refresh: async () => {
        await loadCmsContent(true)
      },
    }
  }
  return ctx
}
