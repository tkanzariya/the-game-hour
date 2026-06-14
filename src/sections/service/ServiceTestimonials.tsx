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

function testimonialReview(t: { review?: string; quote: string }): string {
  return t.review?.trim() || t.quote
}

function testimonialName(t: { name?: string; attribution: string }): string {
  if (t.name?.trim()) return t.name.trim()
  const comma = t.attribution.indexOf(',')
  return comma > 0 ? t.attribution.slice(0, comma).trim() : t.attribution
}

function testimonialRole(t: { role?: string; attribution: string }): string | undefined {
  if (t.role?.trim()) return t.role.trim()
  const comma = t.attribution.indexOf(',')
  if (comma > 0) return t.attribution.slice(comma + 1).trim()
  return undefined
}

function StarRating({ rating }: { rating: number }) {
  const stars = Math.max(1, Math.min(5, Math.round(rating)))
  return (
    <div className="mb-3 flex gap-0.5" aria-label={`${stars} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={
            i < stars ? 'text-secondary-emphasis' : 'text-surface-muted/60'
          }
          aria-hidden
        >
          ★
        </span>
      ))}
    </div>
  )
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
        {testimonials.map((t) => {
          const name = testimonialName(t)
          const role = testimonialRole(t)
          const rating = t.rating ?? 5
          return (
            <RevealItem key={t.id}>
              <blockquote className="surface-clay flex h-full flex-col rounded-2xl p-6 md:p-8">
                <StarRating rating={rating} />
                {t.outcome && (
                  <p className="mb-4 font-heading text-xs font-bold tracking-wide text-secondary-emphasis uppercase">
                    Outcome: {t.outcome}
                  </p>
                )}
                <p className="flex-1 font-body text-base leading-relaxed text-text">
                  &ldquo;{testimonialReview(t)}&rdquo;
                </p>
                <footer className="mt-5 border-t border-surface-muted pt-4">
                  <cite className="not-italic">
                    <span className="block font-heading text-sm font-bold text-primary">
                      {name}
                    </span>
                    {role && (
                      <span className="mt-1 block font-body text-sm text-text-muted">
                        {role}
                      </span>
                    )}
                  </cite>
                </footer>
              </blockquote>
            </RevealItem>
          )
        })}
      </Reveal>
    </Section>
  )
}
