import { FaqAccordion } from '@/components/FaqAccordion'
import { Section } from '@/components/Section'
import { Reveal } from '@/components/motion'
import type { Service } from '@/data/types'
import { getFaqsForService, getFaqsSection } from '@/lib/content/faqs'
import SectionIntro from '@/sections/home/SectionIntro'

type ServiceFaqProps = {
  service: Service
}

export default function ServiceFaq({ service }: ServiceFaqProps) {
  const section = getFaqsSection()
  const faqs = getFaqsForService(service.slug)

  return (
    <Section tone="muted" id="faq" profile="marketing">
      <SectionIntro title={section.title} subtitle={section.subtitle} />
      <Reveal className="mx-auto max-w-3xl">
        <FaqAccordion items={faqs} />
      </Reveal>
    </Section>
  )
}
