import { useId } from 'react'
import {
  Link,
  NavLink,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import Icon from '@/components/Icon/Icon'
import { Seo } from '@/components/Seo'
import { getLogoUrl } from '@/lib/assets'
import { getSiteInfo } from '@/lib/content/company'
import { useOpsAuth } from '@/lib/ops/auth'
import { ROUTES } from '@/constants/routes'
import { buildSeo } from '@/utils/seo'

type NavItem = { to: string; label: string; end: boolean; icon: string }

const dashboard: NavItem = {
  to: ROUTES.ops,
  label: 'Dashboard',
  end: true,
  icon: 'chart',
}

const navGroups: { label: string; icon: string; items: NavItem[] }[] = [
  {
    label: 'Events',
    icon: 'calendar-check',
    items: [
      { to: ROUTES.opsEvents, label: 'Events', end: false, icon: 'list-check' },
      { to: ROUTES.opsCalendar, label: 'Calendar', end: true, icon: 'calendar-check' },
      { to: ROUTES.opsInquiries, label: 'Inquiries', end: false, icon: 'comments' },
    ],
  },
  {
    label: 'Finances',
    icon: 'chart-bar',
    items: [
      { to: ROUTES.opsPayments, label: 'Payments', end: true, icon: 'handshake' },
      { to: ROUTES.opsFinance, label: 'Finance', end: true, icon: 'chart-bar' },
    ],
  },
  {
    label: 'Resources',
    icon: 'box-open',
    items: [
      { to: ROUTES.opsTeam, label: 'Team', end: true, icon: 'users' },
      { to: ROUTES.opsGames, label: 'Games', end: true, icon: 'puzzle-piece' },
      { to: ROUTES.opsInventory, label: 'Inventory', end: false, icon: 'box-open' },
    ],
  },
  {
    label: 'Website & settings',
    icon: 'cogs',
    items: [
      { to: ROUTES.adminPhotos, label: 'Photos', end: true, icon: 'camera' },
      {
        to: ROUTES.adminTestimonials,
        label: 'Testimonials',
        end: true,
        icon: 'comments',
      },
      { to: ROUTES.adminStatistics, label: 'Statistics', end: true, icon: 'chart' },
      { to: ROUTES.opsSettings, label: 'Settings', end: true, icon: 'cogs' },
    ],
  },
]

const navItems = [dashboard, ...navGroups.flatMap((group) => group.items)]

function matchesPage(item: NavItem, pathname: string) {
  return pathname === item.to || (!item.end && pathname.startsWith(item.to + '/'))
}

function pageTitle(pathname: string): string {
  if (pathname.startsWith(`${ROUTES.opsEvents}/`)) return 'Event'
  const hit = navItems.find((item) => matchesPage(item, pathname))
  return hit?.label ?? 'Operations'
}

export default function OpsLayout() {
  const { user, loading, logout } = useOpsAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const drawerId = useId().replace(/:/g, '')
  const inputId = `ops-drawer-${drawerId}`

  const seo = buildSeo({
    title: 'Operations',
    description: 'The Game Hour operations workspace.',
    noIndex: true,
  })

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-base-200">
        <Seo {...seo} />
        <span className="loading loading-spinner loading-lg" aria-label="Loading" />
      </div>
    )
  }

  if (!user) {
    return (
      <Navigate
        to={ROUTES.opsLogin}
        replace
        state={{ from: location.pathname + location.search + location.hash }}
      />
    )
  }

  const onLogout = async () => {
    await logout()
    navigate(ROUTES.opsLogin)
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-svh bg-base-200">
        <Seo {...seo} />
        <div className="navbar bg-neutral text-neutral-content">
          <div className="navbar-start">
            <OpsBrand />
          </div>
          <div className="navbar-end">
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={onLogout}
            >
              Log out
            </button>
          </div>
        </div>
        <main className="mx-auto max-w-lg px-4 py-16">
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h1 className="card-title">Coach workspace coming soon</h1>
              <p>
                You are signed in as a coach. Event tools are limited to admins for now.
                We will add your event list in a later phase.
              </p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const closeDrawer = () => {
    const input = document.getElementById(inputId) as HTMLInputElement | null
    if (input) input.checked = false
  }

  return (
    <div className="drawer lg:drawer-open">
      <Seo {...seo} />
      <input id={inputId} type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex min-h-svh min-w-0 flex-col bg-base-200">
        <header className="navbar border-b border-base-300 bg-base-100" data-ops-nav>
          <div className="navbar-start gap-2">
            <label
              htmlFor={inputId}
              className="btn btn-ghost btn-square drawer-button lg:hidden"
              aria-label="Open menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="size-5"
                aria-hidden
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </label>
            <span className="font-heading text-sm font-semibold sm:text-base">
              {pageTitle(location.pathname)}
            </span>
          </div>
          <div className="navbar-end">
            <button type="button" className="btn btn-sm" onClick={onLogout}>
              Log out
            </button>
          </div>
        </header>
        <main className="mx-auto w-full min-w-0 max-w-7xl flex-1 px-3 py-4 sm:px-4 sm:py-6">
          <Outlet />
        </main>
      </div>
      <div className="drawer-side z-40">
        <label htmlFor={inputId} aria-label="Close menu" className="drawer-overlay" />
        <aside className="flex min-h-full w-64 flex-col border-r border-base-300 bg-neutral text-neutral-content">
          <div className="px-3 pt-4">
            <OpsBrand />
          </div>
          <nav className="grow px-2 py-4" aria-label="Admin navigation">
            <ul className="menu w-full gap-1 p-0 text-base">
              <SidebarLink item={dashboard} onClick={closeDrawer} />
              {navGroups.map((group) => {
                const active = group.items.some((item) =>
                  matchesPage(item, location.pathname),
                )
                return (
                  <li key={group.label}>
                    <details key={active ? location.pathname : 'closed'} open={active}>
                      <summary
                        className={active ? 'font-semibold' : 'text-neutral-content/80'}
                      >
                        <Icon name={group.icon} size="sm" />
                        {group.label}
                      </summary>
                      <ul className="my-1 gap-1">
                        {group.items.map((item) => (
                          <SidebarLink
                            key={item.to}
                            item={item}
                            onClick={closeDrawer}
                          />
                        ))}
                      </ul>
                    </details>
                  </li>
                )
              })}
            </ul>
          </nav>
          <div className="flex flex-col gap-2 border-t border-neutral-content/15 p-4">
            <OpsAccount name={user.name} email={user.email} />
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={onLogout}
            >
              Log out
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}

function SidebarLink({ item, onClick }: { item: NavItem; onClick: () => void }) {
  return (
    <li>
      <NavLink
        to={item.to}
        end={item.end}
        className={({ isActive }) =>
          isActive
            ? 'bg-base-100 text-primary font-semibold shadow'
            : 'text-neutral-content/80 hover:bg-neutral-content/10 hover:text-neutral-content'
        }
        onClick={onClick}
      >
        <Icon name={item.icon} size="sm" />
        {item.label}
      </NavLink>
    </li>
  )
}

function OpsBrand() {
  const site = getSiteInfo()
  const logoUrl = getLogoUrl('dark')
  return (
    <Link
      to={ROUTES.ops}
      data-ops-brand
      className="btn btn-ghost h-12 min-h-12 justify-start gap-2 px-2 text-neutral-content!"
    >
      <img
        src={logoUrl}
        alt={site.name}
        className="h-9 w-auto sm:h-10"
        width={160}
        height={40}
      />
    </Link>
  )
}

function OpsAccount({ name, email }: { name: string; email: string }) {
  const site = getSiteInfo()
  const accountLabel =
    name.trim().toLowerCase() === site.name.trim().toLowerCase() ? email : name
  return <p className="truncate text-xs text-neutral-content/80">{accountLabel}</p>
}
