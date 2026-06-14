import { cn } from '@/utils/cn'
import Icon, { type IconSize } from './Icon'

type IconChipProps = {
  name: string
  size?: IconSize
  className?: string
};

const CHIP_CLASS: Record<IconSize, string> = {
  sm: 'h-9 w-9 rounded-xl',
  md: 'h-11 w-11 rounded-2xl',
  lg: 'h-12 w-12 rounded-2xl',
  xl: 'h-14 w-14 rounded-2xl',
};

export default function IconChip({ name, size = 'md', className }: IconChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center surface-accent-light text-on-accent-subtle',
        CHIP_CLASS[size],
        className,
      )}
      aria-hidden
    >
      <Icon name={name} size={size} />
    </span>
  )
}
