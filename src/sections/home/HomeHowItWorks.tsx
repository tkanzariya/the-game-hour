import { Section } from '@/components/Section'
import { Reveal, RevealItem } from '@/components/motion'
import { getHomeHowItWorksContent } from '@/lib/content/home'
import SectionIntro from './SectionIntro'

export default function HomeHowItWorks() {
  const content = getHomeHowItWorksContent()

  return (
    <Section id="how-it-works" profile="marketing">
      <SectionIntro title={content.title} subtitle={content.subtitle} />
      <Reveal staggerChildren className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {content.steps.map((item, index) => (
          <RevealItem key={item.step}>
            <article className="relative h-full rounded-2xl border-2 border-surface-muted bg-surface-elevated p-6 shadow-card">
              <span
                className="font-heading text-4xl font-extrabold text-secondary/40"
                aria-hidden
              >
                {item.step}
              </span>
              <h3 className="mt-2 font-heading text-xl font-bold text-primary">{item.title}</h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-accent-muted-grey">
                {item.description}
              </p>
              {index < content.steps.length - 1 && (
                <span
                  className="absolute top-1/2 -right-3 hidden h-0.5 w-6 bg-secondary/40 lg:block"
                  aria-hidden
                />
              )}
            </article>
          </RevealItem>
        ))}
      </Reveal>
    </Section>
  )
}
