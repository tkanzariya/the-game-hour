export type LightboxItem = {
  src: string
  alt: string
  caption?: string
  /** Optional higher-resolution source loaded only when lightbox opens */
  srcFull?: string
}

export type LightboxState = {
  isOpen: boolean
  items: LightboxItem[]
  index: number
}

export type OpenLightboxOptions = {
  items: LightboxItem[]
  index?: number
}
