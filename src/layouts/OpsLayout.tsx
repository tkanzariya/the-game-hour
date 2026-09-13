import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Seo } from '@/components/Seo'
import { getLogoUrl } from '@/lib/assets'
import { getSiteInfo } from '@/lib/content/company'
import { useOpsAuth } from '@/lib/ops/auth'
import { ROUTES } from '@/constants/routes'
import { buildSeo } from '@/utils/seo'

export default function OpsLayout() {
  const { user, loading, logout } = useOpsAuth()
  const navigate = useNavigate()
  const location = useLocation()

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
    return <Navigate to={ROUTES.opsLogin} replace state={{ from: location.pathname }} />
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-svh bg-base-200">
        <Seo {...seo} />
        <OpsNav
          name={user.name}
          email={user.email}
          isAdmin={false}
          onLogout={async () => {
            await logout()
            navigate(ROUTES.opsLogin)
          }}
        />
        <main className="mx-auto max-w-lg px-4 py-16">
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h1 className="card-title">Coach workspace coming soon</h1>
              <p>
                You are signed in as a coach. Event tools are limited to admins for
                now. We will add your event list in a later phase.
              </p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-svh overflow-x-clip bg-base-200">
      <Seo {...seo} />
      <OpsNav
        name={user.name}
        email={user.email}
        isAdmin
        onLogout={async () => {
          await logout()
          navigate(ROUTES.opsLogin)
        }}
      />
      <main className="mx-auto w-full min-w-0 max-w-6xl px-3 py-4 sm:px-4 sm:py-6">
        <Outlet />
      </main>
    </div>
  )
}

function OpsNav({
  name,
  email,
  isAdmin,
  onLogout,
}: {
  name: string
  email: string
  isAdmin: boolean
  onLogout: () => void
}) {
  const site = getSiteInfo()
  const logoUrl = getLogoUrl('dark')
  const accountLabel =
    name.trim().toLowerCase() === site.name.trim().toLowerCase() ? email : name

  return (
    <div className="navbar bg-neutral text-neutral-content" data-ops-nav>
      <div className="navbar-start gap-1">
        <Link
          to={ROUTES.opsEvents}
          data-ops-brand
          className="btn btn-ghost h-12 min-h-12 gap-2 px-2 text-neutral-content!"
        >
          <img
            src={logoUrl}
            alt={site.name}
            className="h-9 w-auto sm:h-10"
            width={160}
            height={40}
          />
        </Link>
        <Link
          to={ROUTES.opsEvents}
          className="btn btn-ghost btn-sm text-neutral-content! md:hidden"
        >
          Events
        </Link>
      </div>
      <div className="navbar-center hidden md:flex">
        <ul className="menu menu-horizontal px-1 text-neutral-content">
          <li>
            <NavLink
              to={ROUTES.opsEvents}
              className={({ isActive }) => (isActive ? 'menu-active' : '')}
            >
              Events
            </NavLink>
          </li>
          <li className="menu-disabled">
            <span>Game Cards</span>
          </li>
          <li className="menu-disabled">
            <span>Team</span>
          </li>
        </ul>
      </div>
      <div className="navbar-end gap-2">
        {isAdmin ? (
          <a
            href="/admin/dashboard.php"
            data-ops-cms
            className="btn btn-ghost btn-sm text-neutral-content!"
          >
            Website CMS
          </a>
        ) : null}
        <span className="hidden text-sm text-neutral-content sm:inline">{accountLabel}</span>
        <button type="button" className="btn btn-sm btn-secondary" onClick={onLogout}>
          Log out
        </button>
      </div>
    </div>
  )
}
