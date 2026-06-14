import JsonLd from '@/components/Seo/JsonLd'
import { buildSiteStructuredData } from '@/lib/seo/structured-data'

/** Organization + LocalBusiness JSON-LD injected on every page. */
export default function SiteStructuredData() {
  return <JsonLd data={buildSiteStructuredData()} />
}
