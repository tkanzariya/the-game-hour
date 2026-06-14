import { servicesData } from '@/data'
import type { GameCategory } from '@/data/types'
import { getImageByKey } from '@/lib/assets'

const GAME_CATEGORY_IMAGE_KEYS: Record<string, string> = {
  strategy: 'homepage-strategy-games',
  icebreakers: 'homepage-about-teaser',
  'team-building': 'homepage-team-building',
}

/** Per-service emphasis order (falls back to global list). */
const SERVICE_ACTIVITY_ORDER: Record<string, string[]> = {
  'corporate-games': ['team-building', 'strategy', 'icebreakers'],
  'birthday-games': ['icebreakers', 'strategy', 'team-building'],
  'social-gathering-games': ['icebreakers', 'team-building', 'strategy'],
  'game-festival': ['icebreakers', 'team-building', 'strategy'],
  'school-and-collage-event': ['team-building', 'icebreakers', 'strategy'],
  'wedding-or-haldi-games': ['icebreakers', 'strategy', 'team-building'],
  'traditional-games': ['strategy', 'icebreakers', 'team-building'],
  'bollywood-games': ['icebreakers', 'strategy', 'team-building'],
}

export type ActivityCard = GameCategory & { imageUrl: string }

export function getGameCategories(): GameCategory[] {
  return servicesData.gameCategories ?? []
}

export function getActivitiesForService(slug: string): ActivityCard[] {
  const categories = getGameCategories()
  const order = SERVICE_ACTIVITY_ORDER[slug] ?? categories.map((c) => c.id)

  return order
    .map((id) => categories.find((c) => c.id === id))
    .filter((c): c is GameCategory => Boolean(c))
    .map((category) => ({
      ...category,
      imageUrl: getImageByKey(GAME_CATEGORY_IMAGE_KEYS[category.id]),
    }))
}
