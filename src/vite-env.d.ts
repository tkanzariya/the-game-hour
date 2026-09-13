/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CMS_API_URL?: string
  readonly VITE_CMS_CONTENT_URL?: string
  readonly VITE_BOOKINGS_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
