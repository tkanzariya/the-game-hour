import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MainLayout, OpsLayout, OpsRoot } from '@/layouts'
import { ProductionRedirect } from '@/components/ProductionRedirect'
import { HOME_SECTIONS, ROUTES, bookingSearch } from '@/constants/routes'
import { LegacyServiceRedirect } from '@/components/LegacyServiceRedirect'
import HomePage from '@/pages/HomePage'
import AboutPage from '@/pages/AboutPage'
import ServiceDetailPage from '@/pages/ServiceDetailPage'
import GalleryPage from '@/pages/GalleryPage'
import ContactPage from '@/pages/ContactPage'
import BookingPage from '@/pages/BookingPage'
import GameLibraryPage from '@/pages/GameLibraryPage'
import NotFoundPage from '@/pages/NotFoundPage'
import DesignPreviewPage from '@/pages/DesignPreviewPage'
import NewUiPreviewPage from '@/pages/NewUiPreviewPage'
import CoralThemePreviewPage from '@/pages/CoralThemePreviewPage'
import OpsLoginPage from '@/pages/ops/OpsLoginPage'
import OpsDashboardPage from '@/pages/ops/OpsDashboardPage'
import OpsEventsPage from '@/pages/ops/OpsEventsPage'
import OpsEventDetailPage from '@/pages/ops/OpsEventDetailPage'
import OpsCalendarPage from '@/pages/ops/OpsCalendarPage'
import OpsPaymentsPage from '@/pages/ops/OpsPaymentsPage'
import OpsFinancePage from '@/pages/ops/OpsFinancePage'
import OpsTeamPage from '@/pages/ops/OpsTeamPage'
import OpsGamesPage from '@/pages/ops/OpsGamesPage'
import OpsSettingsPage from '@/pages/ops/OpsSettingsPage'

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
    element: <OpsRoot />,
    children: [
      { path: 'ops/login', element: <OpsLoginPage /> },
      {
        path: 'ops',
        element: <OpsLayout />,
        children: [
          { index: true, element: <OpsDashboardPage /> },
          { path: 'events', element: <OpsEventsPage /> },
          { path: 'events/:id', element: <OpsEventDetailPage /> },
          { path: 'calendar', element: <OpsCalendarPage /> },
          { path: 'payments', element: <OpsPaymentsPage /> },
          { path: 'finance', element: <OpsFinancePage /> },
          { path: 'team', element: <OpsTeamPage /> },
          { path: 'games', element: <OpsGamesPage /> },
          { path: 'settings', element: <OpsSettingsPage /> },
        ],
      },
    ],
  },
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
      { path: 'book', element: <BookingPage /> },
      {
        path: 'book/social',
        element: <Navigate to={{ pathname: ROUTES.book, search: bookingSearch('social') }} replace />,
      },
      {
        path: 'book/corporate',
        element: (
          <Navigate to={{ pathname: ROUTES.book, search: bookingSearch('corporate') }} replace />
        ),
      },
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
