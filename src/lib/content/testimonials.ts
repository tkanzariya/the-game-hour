import testimonialsJson from '@/data/content/testimonials.json'
import {
  getCmsTestimonials,
  isCmsContentReachable,
  type CmsTestimonial,
} from '@/lib/cms-content'
import type { Service, Testimonial, TestimonialsData } from '@/data/types'

const testimonialsData = testimonialsJson as TestimonialsData

function mapCmsTestimonial(row: CmsTestimonial): Testimonial {
  const role = row.role.trim()
  const name = row.name.trim()
  return {
    id: row.id,
    quote: row.review,
    review: row.review,
    name,
    role,
    rating: row.rating,
    attribution: role ? `${name}, ${role}` : name,
    context: row.placement,
    serviceSlug: row.serviceSlug ?? undefined,
  }
}

function cmsTestimonials(): Testimonial[] {
  return getCmsTestimonials().map(mapCmsTestimonial)
}

export function getTestimonialsMeta() {
  return testimonialsData.meta
}

export function getTestimonialsSection(context: 'home'): TestimonialsData['sections']['home']
export function getTestimonialsSection(context: 'service'): TestimonialsData['sections']['service']
export function getTestimonialsSection(context: 'home' | 'service') {
  return testimonialsData.sections[context]
}

export function getServiceTestimonialsSubtitle(serviceName: string): string {
  const template = testimonialsData.sections.service.subtitleTemplate
  const normalized = serviceName.toLowerCase().replace(/ games$/, '')
  return template.replace('{{serviceName}}', normalized)
}

export function getAllTestimonials(): Testimonial[] {
  if (isCmsContentReachable()) return cmsTestimonials()
  return testimonialsData.items
}

export function getHomeTestimonials(): Testimonial[] {
  if (isCmsContentReachable()) {
    return cmsTestimonials().filter((t) => t.context === 'home')
  }
  return testimonialsData.items.filter((t) => t.context === 'home')
}

export function getTestimonialsByService(slug: string): Testimonial[] {
  if (isCmsContentReachable()) {
    return cmsTestimonials().filter(
      (t) => t.context === 'service' && t.serviceSlug === slug,
    )
  }
  return testimonialsData.items.filter(
    (t) => t.context === 'service' && t.serviceSlug === slug,
  )
}

export function getServicePageTestimonials(service: Service): Testimonial[] {
  return getTestimonialsByService(service.slug)
}
