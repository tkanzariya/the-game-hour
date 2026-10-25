import { formatCountdown } from '@/lib/ops/inquiry'
import { useMsLeft } from '@/lib/ops/useMsLeft'

export function Countdown({
  expiresAt,
  serverTime,
  prefix = 'Closes in ',
}: {
  expiresAt: string
  serverTime: string
  prefix?: string
}) {
  const left = useMsLeft(expiresAt, serverTime)
  return <>{left <= 0 ? 'Expired' : `${prefix}${formatCountdown(left)}`}</>
}
