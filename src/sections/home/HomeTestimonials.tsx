import { Section } from '@/components/Section'
import { Reveal, RevealItem } from '@/components/motion'
import { getHomeTestimonials, getTestimonialsSection } from '@/lib/content/testimonials'
import SectionIntro from './SectionIntro'

export default function HomeTestimonials() {
  const section = getTestimonialsSection('home')
  const testimonials = getHomeTestimonials()

  return (
    <Section tone="muted" id="testimonials" profile="marketing">
      <SectionIntro title={section.title} subtitle={section.subtitle} />
      <Reveal staggerChildren className="grid gap-6 md:grid-cols-3">
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
