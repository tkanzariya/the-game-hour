/** Microsoft Clarity project ID — production session recordings & heatmaps. */
export const CLARITY_PROJECT_ID = 'x6t7glrd45'

let initialized = false

export function isClarityEnabled(): boolean {
  return import.meta.env.PROD
}

/** Inject Clarity tag once. No-op in development and if already loaded. */
export function initClarity(): void {
  if (!isClarityEnabled()) return
  if (initialized) return
  if (typeof window === 'undefined') return

  initialized = true

  if (document.querySelector('script[src*="clarity.ms/tag/"]')) {
    return
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  ;(function (c: any, l: Document, a: string, r: string, i: string) {
    c[a] =
      c[a] ||
      function (...args: unknown[]) {
        (c[a].q = c[a].q || []).push(args)
      }
    const t = l.createElement(r) as HTMLScriptElement
    t.async = true
    t.src = `https://www.clarity.ms/tag/${i}`
    const y = l.getElementsByTagName(r)[0]
    y.parentNode?.insertBefore(t, y)
  })(window, document, 'clarity', 'script', CLARITY_PROJECT_ID)
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

/** Label SPA route for Clarity dashboards (History API also auto-detected). */
export function trackClarityPageView(path: string): void {
  if (!isClarityEnabled()) return
  if (typeof window === 'undefined' || typeof window.clarity !== 'function') return

  window.clarity('set', 'page', path || '/')
}

export function isClarityInitialized(): boolean {
  return initialized
}
