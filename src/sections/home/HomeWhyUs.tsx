import { Section } from '@/components/Section'
import { IconChip } from '@/components/Icon'
import { Reveal, RevealItem } from '@/components/motion'
import { resolveIconName } from '@/lib/service-icons'
import { getHomeWhyUsContent } from '@/lib/content/home'
import SectionIntro from './SectionIntro'

export default function HomeWhyUs() {
  const content = getHomeWhyUsContent()

  return (
    <Section tone="muted" id="why-us" profile="marketing">
      <SectionIntro title={content.title} subtitle={content.subtitle} />
      <Reveal staggerChildren className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {content.reasons.map((reason) => (
          <RevealItem key={reason.title}>
            <article className="surface-clay h-full rounded-2xl p-6 transition-brand hover:-translate-y-1 hover:shadow-card-hover">
              <IconChip name={resolveIconName(reason.icon)} size="lg" />
              <h3 className="mt-4 font-heading text-lg font-bold text-primary">{reason.title}</h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-accent-muted-grey">
                {reason.description}
              </p>
            </article>
          </RevealItem>
        ))}
      </Reveal>
    </Section>
  )
}
