import statsJson from '@/data/content/stats.json'
import type { SiteMetric, SiteMetricId, SiteStatsData } from '@/data/types'

const statsData = statsJson as SiteStatsData

export type StatsSectionKey = keyof SiteStatsData['sections']

export function getSiteMetrics(): SiteMetric[] {
  return statsData.metrics
}

export function getSiteMetric(id: SiteMetricId): SiteMetric | undefined {
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
