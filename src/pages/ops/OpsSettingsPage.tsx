import { useOpsAuth } from '@/lib/ops/auth'
import { getSiteInfo } from '@/lib/content/company'

export default function OpsSettingsPage() {
  const { user } = useOpsAuth()
  const site = getSiteInfo()

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <h1 className="font-heading text-2xl font-semibold">Settings</h1>
      <section className="card card-border bg-base-100">
        <div className="card-body">
          <h2 className="card-title">Session</h2>
          <p className="text-sm">
            Signed in as <span className="font-medium">{user?.email}</span>
            {user?.role ? ` (${user.role})` : ''}.
          </p>
          <p className="text-sm opacity-70">{site.name} operations workspace.</p>
        </div>
      </section>
      <section className="card card-border bg-base-100">
        <div className="card-body">
          <h2 className="card-title">Website</h2>
          <p className="text-sm opacity-70">Photos and public copy stay in the Website Manager.</p>
          <div className="card-actions">
            <a href="/admin/dashboard.php" className="btn">
              Website CMS
            </a>
            <a href="/admin/settings.php" className="btn">
              Booking alerts
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
