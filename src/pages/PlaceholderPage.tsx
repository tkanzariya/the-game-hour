import { Seo } from '@/components/Seo'
import { buildSeo } from '@/utils/seo'

type PlaceholderPageProps = {
  title: string
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <>
      <Seo
        {...buildSeo({
          title,
          description: `${title} — The Game Hour, facilitator-led games across Gujarat.`,
        })}
      />
      <main className="container-app-wide pt-nav-clearance pb-12">
        <h1>{title}</h1>
      </main>
    </>
  )
}
