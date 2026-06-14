import homeJson from '@/data/content/home.json'
import type { HomePageContent } from '@/data/types'

const homeData = homeJson as HomePageContent

export function getHomeContent() {
  return homeData
}

export function getHomeHeroContent() {
  return homeData.hero
}

export function getHomeWhyUsContent() {
  return homeData.whyUs
}

export function getHomeHowItWorksContent() {
  return homeData.howItWorks
}
