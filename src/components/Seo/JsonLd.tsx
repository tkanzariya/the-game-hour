import { Helmet } from 'react-helmet-async'

type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[] | null | undefined
}

export default function JsonLd({ data }: JsonLdProps) {
  if (!data) return null

  const items = Array.isArray(data) ? data : [data]

  return (
    <>
      {items.map((item, index) => (
        <Helmet key={index}>
          <script type="application/ld+json">{JSON.stringify(item)}</script>
        </Helmet>
      ))}
    </>
  )
}
