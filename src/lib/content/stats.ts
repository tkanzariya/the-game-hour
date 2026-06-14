import statsJson from '@/data/content/stats.json'
import { getCmsMetricValue, isCmsContentReachable, METRIC_IDS } from '@/lib/cms-content'
import type { SiteMetric, SiteMetricId, SiteStatsData } from '@/data/types'

const statsData = statsJson as SiteStatsData

const FIXED_LABELS: Record<SiteMetricId, string> = {
  'events-hosted': 'Events Hosted',
  participants: 'Participants Engaged',
  'games-conducted': 'Games Conducted',
  'cities-served': 'Cities Served',
}

export type StatsSectionKey = keyof SiteStatsData['sections']

function bundledMetric(id: SiteMetricId): SiteMetric | undefined {
  return statsData.metrics.find((metric) => metric.id === id)
}

export function getSiteMetrics(): SiteMetric[] {
  if (isCmsContentReachable()) {
    return METRIC_IDS.map((id) => ({
      id,
      label: FIXED_LABELS[id],
      value: getCmsMetricValue(id) ?? bundledMetric(id)?.value ?? '',
    }))
  }
  return statsData.metrics
}

export function getSiteMetric(id: SiteMetricId): SiteMetric | undefined {
  if (isCmsContentReachable()) {
    const value = getCmsMetricValue(id) ?? bundledMetric(id)?.value
    if (value === undefined) return undefined
    return { id, label: FIXED_LABELS[id], value }
  }
  return statsData.metrics.find((metric) => metric.id === id)
}

export function getStatsSection(key: StatsSectionKey) {
  return statsData.sections[key]
}

export function getStatsMeta() {
  return statsData.meta
}

export function getHomeGalleryTeaser() {
  return statsData.homeGalleryTeaser
}
