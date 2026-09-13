import { Outlet } from 'react-router-dom'
import { OpsAuthProvider } from '@/lib/ops/auth'

export default function OpsRoot() {
  return (
    <OpsAuthProvider>
      <Outlet />
    </OpsAuthProvider>
  )
}
