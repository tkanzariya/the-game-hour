import { useEffect } from 'react'
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
  useEffect(() => {
    const brand = document.querySelector('[data-ops-brand]')
    const cms = document.querySelector('[data-ops-cms]')
    const brandCs = brand ? getComputedStyle(brand) : null
    const nav = document.querySelector('[data-ops-nav]')
    const navCs = nav ? getComputedStyle(nav) : null
    // #region agent log
    fetch('http://127.0.0.1:7314/ingest/bc48680f-cb31-4c2c-b170-30d2bd81067b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'8016b3'},body:JSON.stringify({sessionId:'8016b3',runId:'run1',hypothesisId:'E',location:'src/layouts/OpsLayout.tsx:OpsNav',message:'ops header contrast',data:{userName:name,brandText:brand?.textContent??null,brandColor:brandCs?.color??null,navBg:navCs?.backgroundColor??null,cmsText:cms?.textContent??null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }, [name])

  return (
    <div className="navbar bg-neutral text-neutral-content" data-ops-nav>
      <div className="navbar-start gap-1">
        <Link to={ROUTES.opsEvents} data-ops-brand className="btn btn-ghost text-lg">
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
          <a href="/admin/dashboard.php" data-ops-cms className="btn btn-ghost btn-sm">
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
