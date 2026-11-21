/**
 * Search titles and descriptions for public pages.
 * Titles lead with what people search for and stay under about 60 characters;
 * descriptions stay under about 155. See docs/WEBSITE_IMPROVEMENT_PLAN.md for the keyword targets.
 */
export type PageMeta = {
  title: string
  description: string
}

export const HOME_META: PageMeta = {
  title: 'Event Games Organiser in Ahmedabad | The Game Hour',
  description:
    'Screen-free, host-led games for birthdays, weddings, corporate offsites, schools and society festivals. We bring the games to your venue in Ahmedabad and across Gujarat.',
}

export const ABOUT_META: PageMeta = {
  title: 'About The Game Hour | Event Games Team in Ahmedabad',
  description:
    'How The Game Hour started and why we run screen-free, host-led games for birthdays, weddings, corporates, schools and festivals across Gujarat.',
}

export const GALLERY_META: PageMeta = {
  title: 'Event Gallery: Real Game Events in Gujarat | The Game Hour',
  description:
    'Photos from real birthday, corporate, wedding, school and society festival game events hosted by The Game Hour in Ahmedabad and across Gujarat.',
}

export const CONTACT_META: PageMeta = {
  title: 'Contact The Game Hour | Event Games in Ahmedabad',
  description:
    'Call, WhatsApp or email The Game Hour in Bodakdev, Ahmedabad to plan host-led games for your birthday, wedding, corporate or community event.',
}

/** Keyed by service slug (services.json). */
const SERVICE_META: Record<string, PageMeta> = {
  'birthday-games': {
    title: 'Birthday Party Games Organiser in Ahmedabad | The Game Hour',
    description:
      'Host-led birthday party games for kids and adults in Ahmedabad and across Gujarat. Age-matched, screen-free rounds run at your venue by our game hosts.',
  },
  'corporate-games': {
    title: 'Corporate Team Building Games in Ahmedabad | The Game Hour',
    description:
      'Team building games and activities for offsites, annual days and employee engagement in Ahmedabad and across Gujarat. Hosts, setup and games included.',
  },
  'social-gathering-games': {
    title: 'Family Get-Together Games in Ahmedabad | The Game Hour',
    description:
      'Icebreakers and group games for family reunions, kitty parties and get-togethers in Ahmedabad and across Gujarat, run by our game hosts at your venue.',
  },
  'game-festival': {
    title: 'Society Festival Games in Ahmedabad | The Game Hour',
    description:
      'Game stations and hosted rounds for society festivals and community events in Ahmedabad and across Gujarat. Built for large, mixed-age crowds.',
  },
  'school-and-collage-event': {
    title: 'School & College Fest Games in Gujarat | The Game Hour',
    description:
      'Hosted games for school carnivals, sports days, college fests, freshers and farewells in Ahmedabad and across Gujarat. Setup and game hosts included.',
  },
  'wedding-or-haldi-games': {
    title: 'Haldi & Wedding Games for Guests, Ahmedabad | The Game Hour',
    description:
      'Haldi, sangeet and wedding games that get both families playing together. Hosted at your venue in Ahmedabad and across Gujarat.',
  },
  'traditional-games': {
    title: 'Traditional Indian Games for Events | The Game Hour',
    description:
      'Sack races, musical chairs and other old-school Indian games, hosted for families, societies and offices in Ahmedabad and across Gujarat.',
  },
  'bollywood-games': {
    title: 'Bollywood Theme Party Games in Ahmedabad | The Game Hour',
    description:
      'Bollywood trivia, music rounds and filmi challenges for parties, sangeets and office events in Ahmedabad and across Gujarat, led by our game hosts.',
  },
}

export function getServiceMeta(slug: string): PageMeta | undefined {
  return SERVICE_META[slug]
}
