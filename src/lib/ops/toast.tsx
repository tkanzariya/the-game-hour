import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type ToastTone = 'success' | 'error'
type ToastItem = { id: number; message: string; tone: ToastTone }

type OpsToastValue = {
  notify: (message: string, tone?: ToastTone) => void
}

const OpsToastContext = createContext<OpsToastValue | null>(null)

export function OpsToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const notify = useCallback((message: string, tone: ToastTone = 'success') => {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setToasts((current) => [...current, { id, message, tone }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id))
    }, 4000)
  }, [])

  const value = useMemo(() => ({ notify }), [notify])

  return (
    <OpsToastContext.Provider value={value}>
      {children}
      {toasts.length > 0 ? (
        <div className="toast toast-bottom toast-end z-50">
          {toasts.map((item) => (
            <div
              key={item.id}
              role="status"
              className={`alert ${item.tone === 'error' ? 'alert-error' : 'alert-success'}`}
            >
              <span>{item.message}</span>
            </div>
          ))}
        </div>
      ) : null}
    </OpsToastContext.Provider>
  )
}

export function useOpsToast(): OpsToastValue {
  const ctx = useContext(OpsToastContext)
  if (!ctx) {
    throw new Error('useOpsToast must be used within OpsToastProvider')
  }
  return ctx
}
