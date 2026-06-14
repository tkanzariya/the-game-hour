import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MainLayout } from '@/layouts'
import { ProductionRedirect } from '@/components/ProductionRedirect'
import { HOME_SECTIONS, ROUTES } from '@/constants/routes'
import { LegacyServiceRedirect } from '@/components/LegacyServiceRedirect'
import HomePage from '@/pages/HomePage'
import AboutPage from '@/pages/AboutPage'
import ServiceDetailPage from '@/pages/ServiceDetailPage'
import GalleryPage from '@/pages/GalleryPage'
import ContactPage from '@/pages/ContactPage'
import GameLibraryPage from '@/pages/GameLibraryPage'
import NotFoundPage from '@/pages/NotFoundPage'
import DesignPreviewPage from '@/pages/DesignPreviewPage'
import NewUiPreviewPage from '@/pages/NewUiPreviewPage'
import CoralThemePreviewPage from '@/pages/CoralThemePreviewPage'

const isDev = import.meta.env.DEV

const experiencesRedirect = (
  <Navigate to={{ pathname: ROUTES.home, hash: HOME_SECTIONS.experiences }} replace />
)

const previewRoutes = isDev
  ? [
      {
        path: ROUTES.designPreview.slice(1),
        element: <DesignPreviewPage />,
      },
      {
        path: ROUTES.newUiPreview.slice(1),
        element: <NewUiPreviewPage />,
      },
      {
        path: ROUTES.themePreviewCoral.slice(1),
        element: <CoralThemePreviewPage />,
      },
    ]
  : [
      {
        path: ROUTES.designPreview.slice(1),
        element: <ProductionRedirect />,
      },
      {
        path: ROUTES.newUiPreview.slice(1),
        element: <ProductionRedirect />,
      },
      {
        path: ROUTES.themePreviewCoral.slice(1),
        element: <ProductionRedirect />,
      },
      {
        path: ROUTES.gameLibrary.slice(1),
        element: experiencesRedirect,
      },
    ]

export const router = createBrowserRouter([
  {
    path: ROUTES.home,
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: ROUTES.about.slice(1), element: <AboutPage /> },
      { path: 'services', element: experiencesRedirect },
      { path: 'services/:slug', element: <ServiceDetailPage /> },
      { path: ROUTES.gallery.slice(1), element: <GalleryPage /> },
      { path: ROUTES.contact.slice(1), element: <ContactPage /> },
      ...(isDev
        ? [{ path: ROUTES.gameLibrary.slice(1), element: <GameLibraryPage /> }]
        : []),
      {
        path: 'corporate-events',
        element: <LegacyServiceRedirect legacyKey="corporate-events" />,
      },
      {
        path: 'birthday-events',
        element: <LegacyServiceRedirect legacyKey="birthday-events" />,
      },
      {
        path: 'school-events',
        element: <LegacyServiceRedirect legacyKey="school-events" />,
      },
      {
        path: 'traditional-games',
        element: <LegacyServiceRedirect legacyKey="traditional-games" />,
      },
      {
        path: 'wedding-events',
        element: <LegacyServiceRedirect legacyKey="wedding-events" />,
      },
      {
        path: 'social-gathering',
        element: <LegacyServiceRedirect legacyKey="social-gathering" />,
      },
      {
        path: 'game-festival',
        element: <LegacyServiceRedirect legacyKey="game-festival" />,
      },
      {
        path: 'bollywood',
        element: <LegacyServiceRedirect legacyKey="bollywood" />,
      },
      ...previewRoutes,
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
