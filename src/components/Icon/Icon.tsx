import { cn } from '@/utils/cn'
import { ICON_PATHS } from './icons'

export type IconSize = 'sm' | 'md' | 'lg' | 'xl'

const SIZE_PX: Record<IconSize, number> = {
  sm: 18,
  md: 22,
  lg: 28,
  xl: 32,
}

export type IconProps = {
  name: string
  size?: IconSize
  className?: string
  label?: string
};

export default function Icon({ name, size = 'md', className, label }: IconProps) {
  const paths = ICON_PATHS[name] ?? ICON_PATHS.check
  const px = SIZE_PX[size]

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('shrink-0', className)}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
    >
      {paths}
    </svg>
  )
}
