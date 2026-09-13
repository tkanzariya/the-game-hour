import { Outlet } from 'react-router-dom'
import { OpsAuthProvider } from '@/lib/ops/auth'
import { OpsToastProvider } from '@/lib/ops/toast'

export default function OpsRoot() {
  return (
    <OpsAuthProvider>
      <OpsToastProvider>
        <Outlet />
      </OpsToastProvider>
    </OpsAuthProvider>
  )
}
