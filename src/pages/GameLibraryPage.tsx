import { Navigate } from 'react-router-dom'
import { HOME_SECTIONS, ROUTES } from '@/constants/routes'

/** Legacy /game-library bookmark → homepage experiences section */
export default function GameLibraryPage() {
  return <Navigate to={{ pathname: ROUTES.home, hash: HOME_SECTIONS.experiences }} replace />
}
