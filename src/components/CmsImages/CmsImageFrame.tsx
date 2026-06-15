import type { ImgHTMLAttributes, ReactNode } from 'react'
import LightboxImage from '@/components/ImageLightbox/LightboxImage'
import { cn } from '@/utils/cn'

type CmsImageFrameProps = {
  ready: boolean
  src: string | undefined
  alt: string
  className?: string
  wrapperClassName?: string
  skeletonClassName?: string
  children?: (src: string) => ReactNode
} & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>

/** Renders a skeleton until CMS manifest is ready, then the resolved image. */
export function CmsImageFrame({
  ready,
  src,
  alt,
  className,
  wrapperClassName,
  skeletonClassName,
  children,
  ...imgProps
}: CmsImageFrameProps) {
  if (!ready || !src) {
    return (
      <div
        className={cn(
          'animate-pulse bg-white/10',
          skeletonClassName ?? className,
          wrapperClassName,
        )}
        aria-hidden
      />
    )
  }

  if (children) {
    return <>{children(src)}</>
  }

  return (
    <LightboxImage
      src={src}
      alt={alt}
      className={className}
      wrapperClassName={wrapperClassName}
      {...imgProps}
    />
  )
}
