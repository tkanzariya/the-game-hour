import { Section } from '@/components/Section'
import { Reveal, RevealItem } from '@/components/motion'
import type { Service } from '@/data/types'
import {
  getServicePageTestimonials,
  getServiceTestimonialsSubtitle,
  getTestimonialsSection,
} from '@/lib/content/testimonials'
import SectionIntro from '@/sections/home/SectionIntro'

type ServiceTestimonialsProps = {
  service: Service
}

export default function ServiceTestimonials({ service }: ServiceTestimonialsProps) {
  const section = getTestimonialsSection('service')
  const testimonials = getServicePageTestimonials(service)

  return (
    <Section id="testimonials" profile="marketing">
      <SectionIntro
        title={section.title}
        subtitle={getServiceTestimonialsSubtitle(service.name)}
      />
      <Reveal staggerChildren className="grid gap-6 md:grid-cols-2 lg:mx-auto lg:max-w-4xl">
        {testimonials.map((t) => (
          <RevealItem key={t.id}>
            <blockquote className="surface-clay flex h-full flex-col rounded-2xl p-6 md:p-8">
              {t.outcome && (
                <p className="mb-4 font-heading text-xs font-bold tracking-wide text-secondary-emphasis uppercase">
                  Outcome: {t.outcome}
                </p>
              )}
              <p className="flex-1 font-body text-base leading-relaxed text-text">
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer className="mt-5 border-t border-surface-muted pt-4">
                <cite className="not-italic">
                  <span className="block font-heading text-sm font-bold text-primary">
                    {t.attribution}
                  </span>
                </cite>
              </footer>
            </blockquote>
          </RevealItem>
        ))}
      </Reveal>
    </Section>
  )
}
