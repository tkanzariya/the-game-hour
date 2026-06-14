import { Section } from '@/components/Section'
import { IconChip } from '@/components/Icon'
import { Reveal, RevealItem } from '@/components/motion'
import { resolveIconName } from '@/lib/service-icons'
import type { Service } from '@/data/types'
import SectionIntro from '@/sections/home/SectionIntro'

type ServiceWhyChooseProps = {
  service: Service
}

export default function ServiceWhyChoose({ service }: ServiceWhyChooseProps) {
  return (
    <Section tone="muted" id="why-choose" profile="marketing">
      <SectionIntro
        title={service.intro.headline}
        subtitle={service.intro.paragraphs[0]}
      />
      {service.intro.paragraphs[1] && (
        <p className="mx-auto -mt-6 mb-10 max-w-3xl text-center font-body text-base leading-relaxed text-accent-muted-grey md:-mt-8 md:mb-12">
          {service.intro.paragraphs[1]}
        </p>
      )}
      <Reveal staggerChildren className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {service.sellingPoints.map((point) => (
          <RevealItem key={point.title}>
            <article className="surface-clay h-full rounded-2xl p-6 transition-brand hover:-translate-y-1 hover:shadow-card-hover">
              <IconChip name={resolveIconName(point.icon)} size="lg" />
              <h3 className="mt-4 font-heading text-lg font-bold text-primary">
                {point.title}
              </h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-accent-muted-grey">
                {point.description}
              </p>
            </article>
          </RevealItem>
        ))}
      </Reveal>
    </Section>
  )
}
