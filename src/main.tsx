import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import '@/styles/globals.css'
import App from '@/App'

const container = document.getElementById('root')!

const app = (
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>
)

// Public pages arrive already rendered (scripts/prerender.mjs): attach to that HTML.
// The app shell used by /ops, /book and /choose-games is empty and renders from scratch.
if (container.hasChildNodes()) {
  hydrateRoot(container, app)
} else {
  createRoot(container).render(app)
}
