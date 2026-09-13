import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Seo } from '@/components/Seo'
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
    <div className="min-h-svh bg-base-200">
      <Seo {...seo} />
      <OpsNav
        name={user.name}
        isAdmin
        onLogout={async () => {
          await logout()
          navigate(ROUTES.opsLogin)
        }}
      />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}

function OpsNav({
  name,
  isAdmin,
  onLogout,
}: {
  name: string
  isAdmin: boolean
  onLogout: () => void
}) {
  return (
    <div className="navbar bg-neutral text-neutral-content">
      <div className="navbar-start gap-1">
        <Link to={ROUTES.opsEvents} className="btn btn-ghost text-lg">
          The Game Hour
        </Link>
        <Link to={ROUTES.opsEvents} className="btn btn-ghost btn-sm md:hidden">
          Events
        </Link>
      </div>
      <div className="navbar-center hidden md:flex">
        <ul className="menu menu-horizontal px-1">
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
          <a href="/admin/dashboard.php" className="btn btn-ghost btn-sm">
            Website CMS
          </a>
        ) : null}
        <span className="hidden text-sm sm:inline">{name}</span>
        <button type="button" className="btn btn-sm" onClick={onLogout}>
          Log out
        </button>
      </div>
    </div>
  )
}
