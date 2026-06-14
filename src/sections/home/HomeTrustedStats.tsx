import { Section } from '@/components/Section'
import { StatCard } from '@/components/StatCard'
import { Reveal, RevealItem } from '@/components/motion'
import { getStatsSection } from '@/lib/content/stats'
import { getSiteMetrics } from '@/lib/site-stats'
import SectionIntro from './SectionIntro'

export default function HomeTrustedStats() {
  const section = getStatsSection('home')
  const metrics = getSiteMetrics()

  return (
    <Section tone="muted" padding="sm" id="trusted" profile="marketing">
      <SectionIntro title={section.title} subtitle={section.subtitle} />
      <Reveal staggerChildren className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((stat) => (
          <RevealItem key={stat.id}>
            <StatCard value={stat.value} label={stat.label} />
          </RevealItem>
        ))}
      </Reveal>
    </Section>
  )
}
