import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useOpsAuth } from '@/lib/ops/auth'
import { useOpsToast } from '@/lib/ops/toast'
import { opsFetch } from '@/lib/ops/api'

async function website<T>(
  section: string,
  params: Record<string, string> = {},
  init?: RequestInit,
) {
  const query = new URLSearchParams({ section, ...params })
  const response = await opsFetch('/cms/api/ops/website.php?' + query, init)
  const data = await response.json().catch(() => null)
  if (!response.ok || !data || data.ok === false) {
    throw new Error(
      data?.error ?? 'The website manager could not complete this request.',
    )
  }
  return data as T
}

function useWebsite<T>(section: string) {
  const { csrf } = useOpsAuth()
  const { notify } = useOpsToast()
  const [data, setData] = useState<T>()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const refresh = useCallback(
    () =>
      website<T>(section).then((result) => {
        setData(result)
        setError('')
      }),
    [section],
  )

  useEffect(() => {
    let active = true
    void website<T>(section).then(
      (result) => {
        if (active) setData(result)
      },
      (e: Error) => {
        if (active) setError(e.message)
      },
    )
    return () => {
      active = false
    }
  }, [section])

  const save = async (
    message: string,
    body?: object,
    params?: Record<string, string>,
    remove = false,
  ) => {
    setBusy(true)
    setError('')
    try {
      const multipart = body instanceof FormData
      await website(section, params, {
        method: remove ? 'DELETE' : 'POST',
        headers: multipart
          ? { 'X-CSRF-Token': csrf }
          : { 'X-CSRF-Token': csrf, 'Content-Type': 'application/json' },
        body: multipart ? body : body ? JSON.stringify(body) : undefined,
      })
      notify(message, 'success')
      await refresh().catch((e: Error) =>
        setError('Saved, but the list could not refresh. ' + e.message),
      )
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.')
      return false
    } finally {
      setBusy(false)
    }
  }
  return { data, error, busy, save, refresh }
}

function Status({
  error,
  loading,
  retry,
}: {
  error: string
  loading: boolean
  retry?: () => void
}) {
  if (error)
    return (
      <div className="alert alert-error" role="alert">
        {error}
        {retry && (
          <button type="button" className="btn btn-sm" onClick={retry}>
            Retry
          </button>
        )}
      </div>
    )
  if (loading)
    return (
      <span className="loading loading-spinner" role="status" aria-label="Loading" />
    )
  return null
}

type Photo = {
  key: string
  title: string
  category: string
  usage: string
  uploaded: boolean
  preview: string | null
}

function PhotoCard({
  photo,
  busy,
  onUpload,
  onRemove,
}: {
  photo: Photo
  busy: boolean
  onUpload: (file: File) => Promise<boolean>
  onRemove: () => void
}) {
  const [broken, setBroken] = useState(false)
  const [file, setFile] = useState<File>()
  const upload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!file) return
    const form = event.currentTarget
    if (await onUpload(file)) {
      form.reset()
      setFile(undefined)
    }
  }
  return (
    <article className="card card-border overflow-hidden bg-base-100">
      {photo.preview && !broken ? (
        <a
          href={photo.preview}
          target="_blank"
          rel="noreferrer"
          aria-label={'Open photo for ' + photo.usage}
        >
          <img
            src={photo.preview}
            alt={photo.title}
            loading="lazy"
            className="aspect-video w-full object-cover"
            onError={() => setBroken(true)}
          />
        </a>
      ) : (
        <div className="grid aspect-video place-content-center bg-base-200 text-sm">
          Preview unavailable
        </div>
      )}
      <div className="card-body p-4">
        <p className="text-xs opacity-70">{photo.category}</p>
        <h2 className="font-semibold">{photo.title}</h2>
        <p className="text-sm">{photo.usage}</p>
        <span className="badge badge-outline">
          {photo.uploaded ? 'Custom upload' : 'Default'}
        </span>
        <form className="mt-2 flex flex-col gap-2" onSubmit={upload}>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="file-input w-full"
            aria-label={'Select photo for ' + (photo.usage || photo.title)}
            onChange={(event) => setFile(event.target.files?.[0])}
            disabled={busy}
          />
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-sm btn-primary" disabled={busy || !file}>
              {photo.uploaded ? 'Replace photo' : 'Upload photo'}
            </button>
            {photo.uploaded && (
              <button
                type="button"
                className="btn btn-sm btn-outline"
                disabled={busy}
                onClick={onRemove}
              >
                Restore default
              </button>
            )}
          </div>
        </form>
      </div>
    </article>
  )
}

export function AdminPhotos() {
  const model = useWebsite<{ photos: Photo[] }>('photos')
  const [params, setParams] = useSearchParams()
  const [revisions, setRevisions] = useState<Record<string, number>>({})
  const category = params.get('category') ?? ''
  const search = params.get('q') ?? ''
  const photos = model.data?.photos ?? []
  const categories = [...new Set(photos.map((photo) => photo.category))].sort()
  const matches = photos.filter(
    (photo) =>
      (!category || photo.category === category) &&
      [photo.key, photo.title, photo.usage, photo.category]
        .join(' ')
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  )
  const filter = (key: string, value: string) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      },
      { replace: true },
    )
  const update = async (photo: Photo, file?: File) => {
    if (!file && !window.confirm('Restore the default image for this photo slot?'))
      return false
    const body = file ? new FormData() : undefined
    if (body && file) body.set('image', file)
    const ok = await model.save(
      file ? 'Photo saved.' : 'Default photo restored.',
      body,
      { key: photo.key },
      !file,
    )
    if (ok) setRevisions((current) => ({ ...current, [photo.key]: Date.now() }))
    return ok
  }
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-semibold">Photos</h1>
      <Status
        error={model.error}
        loading={!model.data}
        retry={!model.data ? () => void model.refresh().catch(() => {}) : undefined}
      />
      {model.data && (
        <>
          <div className="flex flex-wrap gap-2">
            <input
              className="input"
              aria-label="Search photos"
              placeholder="Search photo slots"
              value={search}
              onChange={(event) => filter('q', event.target.value)}
            />
            <select
              className="select"
              aria-label="Photo category"
              value={category}
              onChange={(event) => filter('category', event.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </div>
          <p className="text-sm">
            {matches.length} slots · {matches.filter((photo) => photo.uploaded).length}{' '}
            custom uploads
          </p>
          {matches.length === 0 && <p>No photo slots match these filters.</p>}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {matches.map((photo) => (
              <PhotoCard
                key={photo.key + ':' + (revisions[photo.key] ?? 0)}
                photo={{
                  ...photo,
                  preview:
                    photo.preview &&
                    photo.preview + '&v=' + (revisions[photo.key] ?? 0),
                }}
                busy={model.busy}
                onUpload={(file) => update(photo, file)}
                onRemove={() => void update(photo)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export function AdminStatistics() {
  const model = useWebsite<{
    values: Record<string, string>
    labels: Record<string, string>
  }>('statistics')
  return (
    <div className="max-w-xl space-y-4">
      <h1 className="font-heading text-2xl font-semibold">Statistics</h1>
      <Status error={model.error} loading={!model.data} />
      {model.data && (
        <form
          className="card card-border bg-base-100"
          onSubmit={(event) => {
            event.preventDefault()
            void model.save(
              'Statistics saved.',
              Object.fromEntries(new FormData(event.currentTarget)),
            )
          }}
        >
          <fieldset className="card-body gap-4" disabled={model.busy}>
            {Object.entries(model.data.labels).map(([key, label]) => (
              <label key={key} className="form-control">
                <span className="mb-1 block text-sm font-medium">{label}</span>
                <input
                  name={key}
                  className="input w-full"
                  required
                  maxLength={60}
                  defaultValue={model.data?.values[key]}
                />
              </label>
            ))}
            <button className="btn btn-primary self-start">Save statistics</button>
          </fieldset>
        </form>
      )}
    </div>
  )
}

type Review = {
  id: number
  name: string
  role: string
  review: string
  rating: number
  visible: boolean
  sort_order: number
  placement: 'home' | 'service'
  service_slug: string | null
}
type ReviewData = { testimonials: Review[]; services: { id: string; label: string }[] }

export function AdminTestimonials() {
  const model = useWebsite<ReviewData>('testimonials')
  const [editing, setEditing] = useState<Review | 'new' | null>(null)
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-heading text-2xl font-semibold">Testimonials</h1>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!model.data || model.busy}
          onClick={() => setEditing('new')}
        >
          Add testimonial
        </button>
      </div>
      <Status error={model.error} loading={!model.data} />
      {editing && model.data && (
        <ReviewEditor
          key={editing === 'new' ? 'new' : editing.id}
          review={editing === 'new' ? undefined : editing}
          services={model.data.services}
          busy={model.busy}
          onClose={() => setEditing(null)}
          onSave={async (data) => {
            if (await model.save('Testimonial saved.', data)) setEditing(null)
          }}
        />
      )}
      {model.data?.testimonials.length === 0 && <p>No testimonials yet.</p>}
      {model.data?.testimonials.map((review) => (
        <article key={review.id} className="card card-border bg-base-100">
          <div className="card-body gap-2">
            <h2 className="font-semibold">{review.name}</h2>
            <p className="text-sm opacity-70">
              {review.role} · {review.rating}/5 ·{' '}
              {review.visible ? 'Visible' : 'Hidden'} ·{' '}
              {review.placement === 'home'
                ? 'Homepage'
                : (model.data?.services.find(
                    (service) => service.id === review.service_slug,
                  )?.label ?? 'Service page')}
            </p>
            <p className="whitespace-pre-wrap break-words">{review.review}</p>
            <div className="card-actions">
              <button
                type="button"
                className="btn btn-sm"
                disabled={model.busy}
                onClick={() => setEditing(review)}
              >
                Edit
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline btn-error"
                disabled={model.busy}
                onClick={async () => {
                  if (
                    window.confirm('Delete this testimonial?') &&
                    (await model.save(
                      'Testimonial deleted.',
                      undefined,
                      { id: String(review.id) },
                      true,
                    ))
                  ) {
                    setEditing((current) =>
                      typeof current === 'object' && current?.id === review.id
                        ? null
                        : current,
                    )
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

function ReviewEditor({
  review,
  services,
  busy,
  onClose,
  onSave,
}: {
  review?: Review
  services: ReviewData['services']
  busy: boolean
  onClose: () => void
  onSave: (data: object) => Promise<void>
}) {
  const [placement, setPlacement] = useState(review?.placement ?? 'home')
  const editor = useRef<HTMLFormElement>(null)
  useEffect(() => editor.current?.scrollIntoView({ block: 'nearest' }), [])
  return (
    <form
      ref={editor}
      className="card card-border bg-base-100"
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        void onSave({
          ...Object.fromEntries(data),
          id: review?.id,
          visible: data.has('visible'),
        })
      }}
    >
      <fieldset className="card-body gap-3" disabled={busy}>
        <legend className="sr-only">
          {review ? 'Edit testimonial' : 'New testimonial'}
        </legend>
        <h2 className="card-title">
          {review ? 'Edit testimonial' : 'New testimonial'}
        </h2>
        <label className="grid gap-1">
          Name
          <input
            name="name"
            className="input w-full"
            defaultValue={review?.name}
            required
            maxLength={255}
          />
        </label>
        <label className="grid gap-1">
          Role or company
          <input
            name="role"
            className="input w-full"
            defaultValue={review?.role}
            maxLength={255}
          />
        </label>
        <label className="grid gap-1">
          Review
          <textarea
            name="review"
            className="textarea w-full"
            defaultValue={review?.review}
            required
            maxLength={2000}
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            Rating
            <select
              name="rating"
              className="select w-full"
              defaultValue={review?.rating ?? 5}
            >
              {[1, 2, 3, 4, 5].map((rating) => (
                <option key={rating} value={rating}>
                  {rating} / 5
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            Display order
            <input
              name="sort_order"
              type="number"
              className="input w-full"
              defaultValue={review?.sort_order ?? 0}
              min="-2147483648"
              max="2147483647"
            />
          </label>
          <label className="grid gap-1">
            Placement
            <select
              name="placement"
              className="select w-full"
              value={placement}
              onChange={(event) =>
                setPlacement(event.target.value === 'service' ? 'service' : 'home')
              }
            >
              <option value="home">Homepage</option>
              <option value="service">Service page</option>
            </select>
          </label>
          {placement === 'service' && (
            <label className="grid gap-1">
              Service
              <select
                name="service_slug"
                className="select w-full"
                required
                defaultValue={review?.service_slug ?? ''}
              >
                <option value="">Choose a service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.label}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        <label className="flex items-center gap-2">
          <input
            name="visible"
            type="checkbox"
            className="checkbox checkbox-sm"
            defaultChecked={review?.visible ?? true}
          />{' '}
          Show on website
        </label>
        <div className="card-actions">
          <button className="btn btn-primary">Save testimonial</button>
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </fieldset>
    </form>
  )
}

export function AdminBookingAlerts() {
  const model = useWebsite<{ email: string; configured: boolean }>('alerts')
  return (
    <section className="card card-border bg-base-100">
      <form
        className="card-body"
        onSubmit={(event) => {
          event.preventDefault()
          const submitter = (event.nativeEvent as SubmitEvent).submitter
          const test = submitter?.getAttribute('value') === 'test'
          void model.save(test ? 'Test email sent.' : 'Notification email saved.', {
            email: new FormData(event.currentTarget).get('email'),
            action: test ? 'test' : 'save',
          })
        }}
      >
        <h2 className="card-title">Booking alerts</h2>
        <Status error={model.error} loading={!model.data} />
        {model.data && (
          <fieldset className="flex flex-col gap-3" disabled={model.busy}>
            <label className="grid gap-1">
              Notification email
              <input
                type="email"
                name="email"
                className="input w-full"
                defaultValue={model.data.email}
                required
              />
            </label>
            {!model.data.configured && (
              <p className="text-sm">
                Email delivery is unavailable until the server mail settings are
                configured.
              </p>
            )}
            <div className="card-actions">
              <button className="btn btn-primary">Save email</button>
              <button className="btn" value="test" disabled={!model.data.configured}>
                Send test email
              </button>
            </div>
          </fieldset>
        )}
      </form>
    </section>
  )
}
