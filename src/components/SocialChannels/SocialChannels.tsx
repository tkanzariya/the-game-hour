import { SocialIcon } from '@/components/Icon'
import { cn } from '@/utils/cn'
import { getSocialLinks, getSocialMessagingLines } from '@/lib/content/social'
import type { SocialLinkItem } from '@/data/types'

type SocialChannelsProps = {
  variant?: 'footer' | 'contact'
  className?: string
}

function SocialMessaging({ link, prominent }: { link: SocialLinkItem; prominent?: boolean }) {
  const lines = getSocialMessagingLines(link)
  if (lines.length === 0) return null

  return (
    <span
      className={cn(
        'mt-1 block font-body leading-snug text-white/75',
        prominent ? 'space-y-0.5 text-sm sm:text-base' : 'text-xs sm:text-sm',
      )}
    >
      {lines.map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      ))}
    </span>
  )
}

function SocialCard({
  link,
  compact,
  prominent,
}: {
  link: SocialLinkItem
  compact?: boolean
  prominent?: boolean
}) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 no-underline transition-brand hover:border-secondary/50 hover:bg-white/15 active:scale-[0.99]',
        compact ? 'p-2.5' : 'p-4',
        prominent && 'sm:p-5',
      )}
    >
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-xl surface-accent text-on-accent shadow-sm transition-brand group-hover:shadow-glow-accent',
          compact ? 'h-10 w-10' : prominent ? 'h-12 w-12' : 'h-11 w-11',
        )}
        aria-hidden
      >
        <SocialIcon id={link.id} className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            'block font-heading font-bold text-white',
            prominent ? 'text-base sm:text-lg' : 'text-sm',
          )}
        >
          {link.label}
        </span>
        <SocialMessaging link={link} prominent={prominent} />
      </span>
    </a>
  )
}

export default function SocialChannels({ variant = 'footer', className }: SocialChannelsProps) {
  const links = getSocialLinks()
  const isContact = variant === 'contact'

  return (
    <div className={cn('grid gap-3', isContact ? 'sm:grid-cols-2' : 'grid-cols-1', className)}>
      {links.map((link) => (
        <SocialCard key={link.id} link={link} compact={!isContact} prominent={isContact} />
      ))}
    </div>
  )
}
