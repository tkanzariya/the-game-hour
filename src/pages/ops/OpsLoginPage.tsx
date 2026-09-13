import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Seo } from '@/components/Seo'
import { useOpsAuth } from '@/lib/ops/auth'
import { ROUTES } from '@/constants/routes'
import { buildSeo } from '@/utils/seo'

export default function OpsLoginPage() {
  const { user, loading, login } = useOpsAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const seo = buildSeo({
    title: 'Operations sign in',
    description: 'Sign in to The Game Hour operations workspace.',
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

  if (user) {
    const from = (location.state as { from?: string } | null)?.from
    return <Navigate to={from || ROUTES.opsEvents} replace />
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    const message = await login(username, password)
    setSubmitting(false)
    if (message) {
      setError(message)
      return
    }
    navigate(ROUTES.opsEvents, { replace: true })
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-base-200 px-4">
      <Seo {...seo} />
      <div className="card w-full max-w-md bg-base-100 shadow">
        <form className="card-body" onSubmit={onSubmit}>
          <h1 className="card-title">Operations</h1>
          <p>Sign in to manage events. Website photos stay in the CMS.</p>
          {error ? (
            <div role="alert" className="alert alert-error">
              <span>{error}</span>
            </div>
          ) : null}
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Email or username</legend>
            <input
              className="input w-full"
              type="text"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Password</legend>
            <input
              className="input w-full"
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </fieldset>
          <div className="card-actions mt-2">
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? <span className="loading loading-spinner" /> : null}
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
