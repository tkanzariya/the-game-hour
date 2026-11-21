import NotFoundPage from '@/pages/NotFoundPage'
import { getServiceBySlug } from '@/lib/services'
import { Navigate, useParams } from 'react-router-dom'
import { servicePath, serviceSlugFromUrl, serviceUrlSlug } from '@/constants/routes'
import { Seo, JsonLd } from '@/components/Seo'
import { ServiceStickyCta } from '@/components/ServiceStickyCta'
import { getFaqsForService } from '@/lib/content/faqs'
import {
  getServiceCanonicalUrl,
  getServiceOgImageUrl,
} from '@/lib/services'
import { getServiceMeta } from '@/lib/seo/page-meta'
import { buildFaqPageSchema } from '@/lib/seo/structured-data'
import ServiceActivities from '@/sections/service/ServiceActivities'
import ServiceDetailHero from '@/sections/service/ServiceDetailHero'
import ServiceFaq from '@/sections/service/ServiceFaq'
import ServiceFinalCta from '@/sections/service/ServiceFinalCta'
import ServiceGallery from '@/sections/service/ServiceGallery'
import ServiceIdealFor from '@/sections/service/ServiceIdealFor'
import ServiceTestimonials from '@/sections/service/ServiceTestimonials'
import ServiceWhyChoose from '@/sections/service/ServiceWhyChoose'
import { buildSeo } from '@/utils/seo'

export default function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const service = getServiceBySlug(serviceSlugFromUrl(slug))

  if (!service) {
    return <NotFoundPage variant="service" />
  }

  // Old address of a renamed page: send it to the current one.
  if (slug !== serviceUrlSlug(service.slug)) {
    return <Navigate to={servicePath(service.slug)} replace />
  }

  const meta = getServiceMeta(service.slug)
  const seo = buildSeo({
    title: meta?.title ?? service.name,
    description: meta?.description ?? service.shortDescription,
    canonical: getServiceCanonicalUrl(service.slug),
    ogImage: getServiceOgImageUrl(service.slug),
  })

  const faqSchema = buildFaqPageSchema(getFaqsForService(service.slug))

  return (
    <>
      <Seo {...seo} />
      <JsonLd data={faqSchema} />
      <div className="pb-sticky-cta">
        <ServiceDetailHero service={service} />
        <ServiceWhyChoose service={service} />
        <ServiceGallery service={service} />
        <ServiceActivities service={service} />
        <ServiceIdealFor service={service} />
        <ServiceTestimonials service={service} />
        <ServiceFaq service={service} />
        <ServiceFinalCta service={service} />
      </div>
      <ServiceStickyCta service={service} />
    </>
  )
}
