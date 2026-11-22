import { createBrowserRouter, Navigate, redirect } from 'react-router-dom'
import { OpsLayout, OpsRoot } from '@/layouts'
import { publicRoutes } from '@/public-routes'
import OpsLoginPage from '@/pages/ops/OpsLoginPage'
import OpsDashboardPage from '@/pages/ops/OpsDashboardPage'
import OpsEventsPage from '@/pages/ops/OpsEventsPage'
import OpsEventDetailPage from '@/pages/ops/OpsEventDetailPage'
import OpsCalendarPage from '@/pages/ops/OpsCalendarPage'
import OpsPaymentsPage from '@/pages/ops/OpsPaymentsPage'
import OpsFinancePage from '@/pages/ops/OpsFinancePage'
import OpsTeamPage from '@/pages/ops/OpsTeamPage'
import OpsGamesPage from '@/pages/ops/OpsGamesPage'
import OpsInquiriesPage from '@/pages/ops/OpsInquiriesPage'
import OpsInventoryPage from '@/pages/ops/OpsInventoryPage'
import OpsInventoryItemPage from '@/pages/ops/OpsInventoryItemPage'
import OpsInquiryDetailPage from '@/pages/ops/OpsInquiryDetailPage'
import OpsInquiryFormPage from '@/pages/ops/OpsInquiryFormPage'
import ChooseGamesPage from '@/pages/ChooseGamesPage'
import OpsSettingsPage from '@/pages/ops/OpsSettingsPage'

import {
  AdminPhotos,
  AdminStatistics,
  AdminTestimonials,
} from '@/pages/ops/AdminWebsitePages'

export const router = createBrowserRouter([
  { path: 'choose-games/:token', element: <ChooseGamesPage /> },
  {
    element: <OpsRoot />,
    children: [
      { path: 'admin/login', element: <OpsLoginPage /> },
      {
        path: 'admin',
        element: <OpsLayout />,
        children: [
          { index: true, element: <Navigate to="/admin/dashboard" replace /> },
          { path: 'dashboard', element: <OpsDashboardPage /> },
          { path: 'photos', element: <AdminPhotos /> },
          { path: 'testimonials', element: <AdminTestimonials /> },
          { path: 'statistics', element: <AdminStatistics /> },
          { path: 'events', element: <OpsEventsPage /> },
          { path: 'events/:id', element: <OpsEventDetailPage /> },
          { path: 'calendar', element: <OpsCalendarPage /> },
          { path: 'payments', element: <OpsPaymentsPage /> },
          { path: 'finance', element: <OpsFinancePage /> },
          { path: 'team', element: <OpsTeamPage /> },
          { path: 'games', element: <OpsGamesPage /> },
          { path: 'inventory', element: <OpsInventoryPage /> },
          { path: 'inventory/:id', element: <OpsInventoryItemPage /> },
          { path: 'inquiries', element: <OpsInquiriesPage /> },
          { path: 'inquiries/new', element: <OpsInquiryFormPage /> },
          { path: 'inquiries/:id', element: <OpsInquiryDetailPage /> },
          { path: 'inquiries/:id/edit', element: <OpsInquiryFormPage /> },
          { path: 'settings', element: <OpsSettingsPage /> },
        ],
      },
    ],
  },
  {
    path: 'ops/*',
    loader: ({ request }) => {
      const url = new URL(request.url)
      const path = url.pathname.replace(/^\/ops(?=\/|$)/i, '/admin')
      return redirect(
        (path.replace(/\/$/, '') === '/admin' ? '/admin/dashboard' : path) + url.search,
      )
    },
  },
  ...publicRoutes,
])
