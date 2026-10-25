import { INQUIRY_STATUS } from '@/lib/ops/inquiry'
import type { InquiryStatus } from '@/lib/ops/types'

/** Status is spelled out, never colour alone. */
export function InquiryStatusBadge({ status }: { status: InquiryStatus }) {
  const info = INQUIRY_STATUS[status]
  return (
    <span
      className={`badge badge-soft ${info.badge} whitespace-nowrap`}
      title={info.hint}
    >
      {info.label}
    </span>
  )
}
