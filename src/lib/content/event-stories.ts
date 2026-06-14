import eventStoriesJson from '@/data/content/event-stories.json'
import type { EventStoriesData, EventStoryItem, EventStoryStatus } from '@/data/types'

const eventStoriesData = eventStoriesJson as EventStoriesData

export function getEventStoriesContent() {
  return eventStoriesData
}

export function getAllEventStories(): EventStoryItem[] {
  return eventStoriesData.items
}

export function getEventStoriesByStatus(status: EventStoryStatus): EventStoryItem[] {
  return eventStoriesData.items.filter((item) => item.status === status)
}

export function getPublishedEventStories(): EventStoryItem[] {
  return getEventStoriesByStatus('published')
}

export function getFeaturedEventStories(): EventStoryItem[] {
  return getPublishedEventStories().filter((item) => item.featured)
}

export function getEventStoryById(id: string): EventStoryItem | undefined {
  return eventStoriesData.items.find((item) => item.id === id)
}

export function getEventStoriesByService(slug: string): EventStoryItem[] {
  return getPublishedEventStories().filter((item) => item.serviceSlug === slug)
}
