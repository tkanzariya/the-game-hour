import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export type ContainerWidth = 'default' | 'wide'

type ContainerProps = {
  children: ReactNode
  className?: string
  as?: 'div' | 'section' | 'article' | 'main'
  width?: ContainerWidth
}

export default function Container({
  children,
  className,
  as: Tag = 'div',
  width = 'default',
}: ContainerProps) {
  return (
    <Tag
      className={cn(width === 'wide' ? 'container-app-wide' : 'container-app', className)}
    >
      {children}
    </Tag>
  )
}
