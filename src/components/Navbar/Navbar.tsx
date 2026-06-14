import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Container } from '@/components/Container'
import { useScrolled } from '@/hooks/useScrolled'
import { cn } from '@/utils/cn'
import { ROUTES } from '@/constants/routes'
import { getBookingLabel, getDefaultBookingUrl } from '@/lib/content/booking'
import { getSiteInfo } from '@/lib/content/company'
import { getMainNavLinks } from '@/lib/navigation'
import { getLogoUrl } from '@/lib/assets'

export default function Navbar() {
  const scrolled = useScrolled(16)
  const [open, setOpen] = useState(false)
  const navLinks = getMainNavLinks()
  const logoUrl = getLogoUrl('dark')
  const site = getSiteInfo()
  const bookingUrl = getDefaultBookingUrl()
  const bookLabel = getBookingLabel('book')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'rounded-full px-3.5 py-2 text-sm font-medium text-white/88 no-underline transition-brand hover:bg-white/10 hover:text-secondary',
      isActive && 'bg-white/12 text-secondary font-semibold',
    )

  return (
    <header className="pointer-events-none fixed top-0 right-0 left-0 z-50 pt-3 md:pt-4">
      <Container width="wide" className="pointer-events-auto">
        <div
          className={cn(
            'nav-float-shell rounded-2xl transition-all duration-300 ease-out md:rounded-full',
            scrolled ? 'nav-float-shell-scrolled' : 'shadow-fab',
            scrolled ? 'md:py-1.5' : 'md:py-2',
          )}
        >
          <div
            className={cn(
              'flex items-center justify-between gap-3 px-3 sm:px-4',
              scrolled ? 'min-h-[3.5rem]' : 'min-h-16',
            )}
          >
            <Link
              to={ROUTES.home}
              className={cn(
                'flex shrink-0 items-center rounded-xl py-1 pr-2 transition-brand hover:opacity-95',
                scrolled ? 'pl-0.5' : 'pl-1',
              )}
              onClick={() => setOpen(false)}
            >
              <img
                src={logoUrl}
                alt={site.name}
                className={cn(
                  'w-auto transition-all duration-300',
                  scrolled ? 'h-9 sm:h-10' : 'h-11 sm:h-12 md:h-[3.25rem]',
                )}
                width={160}
                height={52}
              />
            </Link>

            <nav
              className="hidden items-center gap-0.5 lg:flex"
              aria-label="Main navigation"
            >
              {navLinks.map(({ label, to }) => (
                <NavLink key={to} to={to} className={linkClass}>
                  {label}
                </NavLink>
              ))}

              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 inline-flex min-h-10 shrink-0 items-center justify-center rounded-full surface-accent px-5 py-2 text-sm font-bold text-on-accent shadow-sm transition-brand hover:shadow-glow-accent hover:brightness-105 active:translate-y-px active:brightness-95"
              >
                {bookLabel}
              </a>
            </nav>

            <div className="flex items-center gap-2 lg:hidden">
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center justify-center rounded-full surface-accent px-4 py-2 text-sm font-bold text-on-accent shadow-sm transition-brand hover:brightness-105 active:translate-y-px"
              >
                {bookLabel}
              </a>
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white transition-brand hover:bg-white/15 active:scale-[0.98]"
                aria-expanded={open}
                aria-controls="mobile-nav"
                aria-label={open ? 'Close menu' : 'Open menu'}
                onClick={() => setOpen((v) => !v)}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden
                >
                  {open ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div
          id="mobile-nav"
          className={cn(
            'nav-float-shell mt-2 overflow-hidden rounded-2xl transition-all duration-300 lg:hidden',
            open
              ? 'visible max-h-[min(80vh,32rem)] opacity-100'
              : 'invisible max-h-0 opacity-0',
          )}
          aria-hidden={!open}
        >
          <nav className="flex flex-col gap-1 p-3" aria-label="Mobile navigation">
            {navLinks.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-12 items-center rounded-xl px-4 font-semibold text-white no-underline transition-brand hover:bg-white/10 active:bg-white/15',
                    isActive && 'bg-white/12 text-secondary',
                  )
                }
                onClick={() => setOpen(false)}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </Container>
    </header>
  )
}
