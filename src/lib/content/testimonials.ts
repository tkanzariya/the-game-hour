import testimonialsJson from '@/data/content/testimonials.json'
import type { Service, Testimonial, TestimonialsData } from '@/data/types'

const testimonialsData = testimonialsJson as TestimonialsData

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
  return testimonialsData.items
}

export function getHomeTestimonials(): Testimonial[] {
  return testimonialsData.items.filter((t) => t.context === 'home')
}

export function getTestimonialsByService(slug: string): Testimonial[] {
  return testimonialsData.items.filter(
    (t) => t.context === 'service' && t.serviceSlug === slug,
  )
}

export function getServicePageTestimonials(service: Service): Testimonial[] {
  return getTestimonialsByService(service.slug)
}
