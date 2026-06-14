import faqsJson from '@/data/content/faqs.json'
import { getBookingLinks } from '@/lib/content/booking'
import { getContactInfo } from '@/lib/content/company'
import type { FaqItem, FaqsContentData } from '@/data/types'

const faqsData = faqsJson as FaqsContentData

const SERVICE_FAQ_CATEGORIES: Record<string, string[]> = {
  'corporate-games': ['general', 'booking', 'corporate', 'services'],
  'birthday-games': ['general', 'booking', 'services'],
  'social-gathering-games': ['general', 'booking', 'services'],
  'game-festival': ['general', 'booking', 'services'],
  'school-and-collage-event': ['general', 'booking', 'services'],
  'wedding-or-haldi-games': ['general', 'booking', 'services'],
  'traditional-games': ['general', 'booking', 'services'],
  'bollywood-games': ['general', 'booking', 'services'],
}

const DEFAULT_CATEGORIES = ['general', 'booking', 'services']

function resolveBookingFaqAnswer(): string {
  const contact = getContactInfo()
  const booking = getBookingLinks()
  const { responseTime } = faqsData.bookingFaq
  return `Use our online booking form at ${booking.urls.default}, email ${contact.email}, call ${contact.phoneDisplay}, or WhatsApp. ${responseTime}`
}

function resolveFaqItem(item: FaqsContentData['items'][number]): FaqItem {
  if ('dynamic' in item && item.dynamic) {
    return {
      id: item.id,
      question: item.question,
      answer: resolveBookingFaqAnswer(),
      category: item.category,
    }
  }

  const staticItem = item as Extract<FaqsContentData['items'][number], { answer: string }>
  return {
    id: staticItem.id,
    question: staticItem.question,
    answer: staticItem.answer,
    category: staticItem.category,
  }
}

export function getFaqsSection() {
  return faqsData.sections.service
}

export function getAllFaqs(): FaqItem[] {
  return faqsData.items.map(resolveFaqItem)
}

export function getFaqsForService(slug: string): FaqItem[] {
  const categories = SERVICE_FAQ_CATEGORIES[slug] ?? DEFAULT_CATEGORIES
  return getAllFaqs().filter((item) => categories.includes(item.category ?? 'general'))
}
