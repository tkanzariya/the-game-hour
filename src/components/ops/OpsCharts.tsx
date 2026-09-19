import { useMemo, useState, type ReactNode } from 'react'
import { formatMoney } from '@/lib/ops/format'
import type { OpsSummaryMonth } from '@/lib/ops/types'

function monthLabel(key: string): string {
  const parsed = new Date(`${key}-01T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return key
  return parsed.toLocaleDateString('en-IN', { month: 'short' })
}

function compactMoney(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
  if (value >= 1000) return `₹${Math.round(value / 1000)}k`
  return formatMoney(value)
}

type HoverIndex = number | null

const CHART = { w: 720, h: 280, l: 52, r: 16, t: 20, b: 40 }

function plotWidth(): number {
  return CHART.w - CHART.l - CHART.r
}

function plotHeight(): number {
  return CHART.h - CHART.t - CHART.b
}

export function MoneyByMonthChart({ rows }: { rows: OpsSummaryMonth[] }) {
  const [hover, setHover] = useState<HoverIndex>(null)
  const max = useMemo(
    () => Math.max(...rows.map((row) => Math.max(row.price, row.expenses)), 1),
    [rows],
  )

  if (rows.length === 0) {
    return <p className="text-sm text-base-content/70">No money to show for this range.</p>
  }

  const groupW = plotWidth() / rows.length
  const xAt = (i: number) =>
    rows.length === 1 ? CHART.l + plotWidth() / 2 : CHART.l + groupW * i + groupW / 2
  const yAt = (value: number) => CHART.t + plotHeight() - (value / max) * plotHeight()
  const revenueLine = rows.map((row, i) => `${xAt(i)},${yAt(row.price)}`).join(' ')
  const expenseLine = rows.map((row, i) => `${xAt(i)},${yAt(row.expenses)}`).join(' ')
  const lastX = xAt(rows.length - 1)
  const baseY = CHART.t + plotHeight()
  const revenueArea = `${xAt(0)},${baseY} ${revenueLine} ${lastX},${baseY}`
  const active = hover != null ? rows[hover] : null

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${CHART.w} ${CHART.h}`}
        className="h-64 w-full"
        role="img"
        aria-label="Revenue and expense by month"
        onMouseLeave={() => setHover(null)}
      >
        {[0, 0.5, 1].map((t) => {
          const y = CHART.t + plotHeight() * (1 - t)
          return (
            <g key={t}>
              <line x1={CHART.l} x2={CHART.w - CHART.r} y1={y} y2={y} className="stroke-base-300" />
              <text x={CHART.l - 8} y={y + 4} textAnchor="end" className="fill-base-content/50 text-[11px]">
                {compactMoney(max * t)}
              </text>
            </g>
          )
        })}
        <polygon points={revenueArea} className="fill-primary/10" />
        <polyline points={revenueLine} fill="none" className="stroke-primary" strokeWidth="2.5" strokeLinejoin="round" />
        <polyline
          points={expenseLine}
          fill="none"
          className="stroke-warning"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeDasharray="6 4"
        />
        {active ? (
          <line
            x1={xAt(hover ?? 0)}
            x2={xAt(hover ?? 0)}
            y1={CHART.t}
            y2={baseY}
            className="stroke-base-content/25"
          />
        ) : null}
        {rows.map((row, i) => {
          const lit = hover === i
          const r = lit ? 6 : 4
          return (
            <g key={row.month}>
              <circle cx={xAt(i)} cy={yAt(row.price)} r={r} className="fill-primary" />
              <circle cx={xAt(i)} cy={yAt(row.expenses)} r={r} className="fill-warning" />
              <text
                x={xAt(i)}
                y={CHART.h - 14}
                textAnchor="middle"
                className={`text-[11px] ${lit ? 'fill-base-content font-semibold' : 'fill-base-content/60'}`}
              >
                {monthLabel(row.month)}
              </text>
              <rect
                x={CHART.l + groupW * i}
                y={CHART.t}
                width={groupW}
                height={plotHeight()}
                className="cursor-pointer fill-transparent"
                onMouseEnter={() => setHover(i)}
              />
            </g>
          )
        })}
      </svg>
      {active ? (
        <ChartTip title={monthLabel(active.month)}>
          <TipRow label="Revenue" value={formatMoney(active.price)} />
          <TipRow label="Expense" value={formatMoney(active.expenses)} />
          <TipRow label="Profit" value={formatMoney(active.price - active.expenses)} />
        </ChartTip>
      ) : null}
    </div>
  )
}

export function EventsByMonthChart({ rows }: { rows: OpsSummaryMonth[] }) {
  const [hover, setHover] = useState<HoverIndex>(null)
  const max = useMemo(
    () => Math.max(...rows.map((row) => row.events), 1),
    [rows],
  )

  if (rows.length === 0) {
    return <p className="text-sm text-base-content/70">No events to show for this range.</p>
  }

  const groupW = plotWidth() / rows.length
  const barW = Math.min(36, groupW * 0.55)
  const active = hover != null ? rows[hover] : null

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${CHART.w} ${CHART.h}`}
        className="h-64 w-full"
        role="img"
        aria-label="Events by month"
        onMouseLeave={() => setHover(null)}
      >
        {[0, 0.5, 1].map((t) => {
          const y = CHART.t + plotHeight() * (1 - t)
          return (
            <g key={t}>
              <line x1={CHART.l} x2={CHART.w - CHART.r} y1={y} y2={y} className="stroke-base-300" />
              <text x={CHART.l - 8} y={y + 4} textAnchor="end" className="fill-base-content/50 text-[11px]">
                {Math.round(max * t)}
              </text>
            </g>
          )
        })}
        {rows.map((row, i) => {
          const cx = CHART.l + groupW * i + groupW / 2
          const total = Math.max(row.events, 1)
          const h = (row.events / max) * plotHeight()
          const y = CHART.t + plotHeight() - h
          const hOver = (row.overdue / total) * h
          const hUp = (row.upcoming / total) * h
          const hDone = h - hOver - hUp
          const lit = hover === i
          return (
            <g key={row.month}>
              <rect x={cx - barW / 2} y={y} width={barW} height={Math.max(hDone, 0)} rx="0" className={lit ? 'fill-success' : 'fill-success/80'} />
              <rect x={cx - barW / 2} y={y + hDone} width={barW} height={Math.max(hUp, 0)} className={lit ? 'fill-info' : 'fill-info/80'} />
              <rect
                x={cx - barW / 2}
                y={y + hDone + hUp}
                width={barW}
                height={Math.max(hOver, 0)}
                rx="0"
                className={lit ? 'fill-error' : 'fill-error/80'}
              />
              <text
                x={cx}
                y={CHART.h - 14}
                textAnchor="middle"
                className={`text-[11px] ${lit ? 'fill-base-content font-semibold' : 'fill-base-content/60'}`}
              >
                {monthLabel(row.month)}
              </text>
              <rect
                x={CHART.l + groupW * i}
                y={CHART.t}
                width={groupW}
                height={plotHeight()}
                className="cursor-pointer fill-transparent"
                onMouseEnter={() => setHover(i)}
              />
            </g>
          )
        })}
      </svg>
      {active ? (
        <ChartTip title={monthLabel(active.month)}>
          <TipRow label="Events" value={String(active.events)} />
          <TipRow label="Done" value={String(active.finished)} />
          <TipRow label="Coming" value={String(active.upcoming)} />
          <TipRow label="Date over" value={String(active.overdue)} />
        </ChartTip>
      ) : null}
    </div>
  )
}

function ChartTip({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="pointer-events-none absolute top-4 right-4 z-10 min-w-44">
      <div className="card card-sm bg-neutral text-neutral-content shadow-lg">
        <div className="card-body gap-1 py-3">
          <p className="font-heading text-sm font-semibold">{title}</p>
          {children}
        </div>
      </div>
    </div>
  )
}

function TipRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex justify-between gap-6 text-sm tabular-nums">
      <span className="text-neutral-content/70">{label}</span>
      <span>{value}</span>
    </p>
  )
}
