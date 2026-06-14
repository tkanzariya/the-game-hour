import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  getCmsManifest,
  getImageByKey,
  isCmsManifestLoaded,
  loadCmsManifest,
  type CmsManifest,
} from '@/lib/cms-images'

type CmsImagesContextValue = {
  loaded: boolean
  manifest: CmsManifest
  getImageByKey: (key: string) => string
  refresh: () => Promise<void>
}

const CmsImagesContext = createContext<CmsImagesContextValue | null>(null)

export function CmsImagesProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState(isCmsManifestLoaded())
  const [manifest, setManifest] = useState<CmsManifest>(getCmsManifest())
  /** Bump when manifest loads so getAssetUrl() picks up CMS URLs after async fetch */
  const [manifestEpoch, setManifestEpoch] = useState(0)

  const refresh = async (): Promise<void> => {
    const next = await loadCmsManifest(true)
    setManifest({ ...next })
    setLoaded(true)
    setManifestEpoch((n) => n + 1)
  }

  useEffect(() => {
    void refresh()
  }, [])

  return (
    <CmsImagesContext.Provider
      value={{
        loaded,
        manifest,
        getImageByKey,
        refresh,
      }}
    >
      <div key={manifestEpoch}>{children}</div>
    </CmsImagesContext.Provider>
  )
}

export function useCmsImages(): CmsImagesContextValue {
  const ctx = useContext(CmsImagesContext)
  if (!ctx) {
    return {
      loaded: isCmsManifestLoaded(),
      manifest: getCmsManifest(),
      getImageByKey,
      refresh: async () => {
        await loadCmsManifest(true)
      },
    }
  }
  return ctx
}
