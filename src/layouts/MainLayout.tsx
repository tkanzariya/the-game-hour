import { Outlet } from 'react-router-dom'
import { Analytics } from '@/components/Analytics'
import { CmsImagesProvider } from '@/components/CmsImages'
import { SiteStructuredData } from '@/components/Seo'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { FloatingActions } from '@/components/FloatingActions'
import { ScrollToTop } from '@/components/ScrollToTop'
import { LightboxProvider } from '@/components/ImageLightbox'

export default function MainLayout() {
  return (
    <LightboxProvider>
      <CmsImagesProvider>
        <SiteStructuredData />
        <div className="flex min-h-svh flex-col">
          <Analytics />
          <ScrollToTop />
          <Navbar />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
          <FloatingActions />
        </div>
      </CmsImagesProvider>
    </LightboxProvider>
  )
}
