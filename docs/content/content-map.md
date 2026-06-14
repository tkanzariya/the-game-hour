# The Game Hour: Content Map

> Extracted from `TheGameHour-legacy` (read-only). Machine-readable services: `src/data/services.json`.

---

## Site map

| Page               | Legacy file                     | Route (v2 proposed)                  | Status                              |
| ------------------ | ------------------------------- | ------------------------------------ | ----------------------------------- |
| Home               | `index.html`                    | `/`                                  | Content ready                       |
| About              | `about-us.html`                 | `/about`                             | Content ready                       |
| Gallery            | `gallery.html`                  | `/gallery`                           | Content ready                       |
| Contact            | `contact-us.html`               | `/contact`                           | Content ready (needs brand unify)   |
| Services (hub)     | `index.html#services`           | `/services` or `/#services`          | Cards on home only                  |
| Birthday           | `birthday-games.html`           | `/services/birthday-games`           | Full page                           |
| Corporate          | `corporate-games.html`          | `/services/corporate-games`          | Full page                           |
| Social gathering   | `social-gathering-games.html`   | `/services/social-gathering-games`   | Full page                           |
| Game festival      | `game-festival.html`            | `/services/game-festival`            | Full page                           |
| School/college     | `school-and-collage-event.html` | `/services/school-and-collage-event` | Full page                           |
| Wedding/Haldi      | `wedding-or-haldi-games.html`   | `/services/wedding-or-haldi-games`   | Full page                           |
| Traditional        | `traditional-games.html`        | `/services/traditional-games`        | Full page                           |
| Bollywood          | `bollywood-games.html`          | `/services/bollywood-games`          | Full page                           |
| Game library       | `game-library.html`             | `/games`                             | **Missing file** (linked from home) |
| Privacy policy     | footer `#`                      | `/privacy`                           | **Missing**                         |
| Booking (external) | Bubble app                      | External URL                         | `services.json` → `bookingUrl`      |

**Shared chrome:** `reusables/header.html`, `reusables/footer.html` (loaded via JS).

---

## Global / reusable copy

### Brand taglines

- Hero: **“Unleash the Fun. Reconnect with Joy.”**
- Supporting: _“Take a break from the digital world and create unforgettable memories with nostalgic games and interactive activities.”_
- Footer: _“Bringing people together through fun, nostalgic games and interactive activities for all events.”_

### Primary CTAs

| Label                  | Target                                              |
| ---------------------- | --------------------------------------------------- |
| Book Now               | `https://the-game-hour.bubbleapps.io/version-test/` |
| Explore Games          | `/#games`                                           |
| Learn More             | Per-service detail page                             |
| View Full Gallery      | `/gallery.html`                                     |
| View Full Game Library | `game-library.html` (**broken**)                    |
| Get in Touch           | `mailto:info@thegamehour.com`                       |
| WhatsApp Us            | `https://wa.me/919924007700`                        |

### Contact (canonical: footer)

| Field     | Value                     |
| --------- | ------------------------- |
| Location  | Ahmedabad, Gujarat, India |
| Phone     | +91 9924007700            |
| Email     | info@thegamehour.com      |
| Facebook  | `/TheGameHour`            |
| Instagram | `@thegamehour`            |
| LinkedIn  | The Game Hour             |

**Note:** Contact page lists different phone `+91 987 654 3210`, treat as **error**; use footer number in v2.

---

## Home (`index.html`)

### Hero

- **H1:** Unleash the Fun. Reconnect with Joy.
- **Subcopy:** Digital break / nostalgic games / unforgettable memories
- **CTAs:** Book Now · Explore Games

### About (short)

- **H2:** About The Game Hour
- **Body:** Power of play, genuine connections, screen-free celebrations
- **Link:** Learn more about us → `/about-us.html`

### Services grid

- **H2:** Our Services
- 8 cards, see `services.json` for titles + blurbs

### Game highlights

- **H2:** Our Game Experience Highlights
- **Description:** Exciting game categories sample
- **Cards:** Strategy Games · Icebreakers & Fun Starters · Collaborative Team Building
- **CTA:** View Full Game Library (broken link)

### Testimonials

- **H2:** What Our Clients Say
- Rahul Sharma, CEO, Tech Solutions, corporate hit
- Priya Patel, Birthday Host, daughter’s birthday
- Anand Singh, Society Committee, festival variety

### Gallery teaser

- **H2:** Moments of Pure Joy
- **Description:** See the magic at past events
- 6 preview images
- **CTA:** View Full Gallery
- **CSS note:** `#gallery { display: none }`, section hidden on live CSS

### Why choose us

- **H2:** Why Choose The Game Hour?
- Expert Coaches · 100+ Unique Games · Custom Event Planning · Suitable for All Ages · Affordable & Reliable · Engaging & Nostalgic

### Our reach

- **H2:** Our Reach: Bringing Fun Across Gujarat
- **Description:** Cities of Gujarat
- **Cities:** Ahmedabad · Gandhinagar · Rajkot · Vadodara · Surat · Anand

### FAQs

None on legacy marketing pages.

---

## About (`about-us.html`)

### Hero

- **H1:** About The Game Hour
- **Subcopy:** Screen-free fun and human connection for all ages

### Journey

- **H2:** Our Journey: Igniting Joy Through Play
- **Lead:** Born from idea of human connection through play in digital world

| Era     | Title             | Summary                                            |
| ------- | ----------------- | -------------------------------------------------- |
| 2022    | The Spark         | Family gathering / old-school games inspiration    |
| 2023    | Humble Beginnings | Community events → word of mouth                   |
| Present | Growing Impact    | Birthdays, corporate, festivals, social gatherings |

### Mission & vision

- **Mission:** Unforgettable interactive experiences through play
- **Vision:** Leading screen-free game-based events provider

### Core values (6)

Joy & Enthusiasm · Inclusivity & Connection · Creativity & Innovation · Professionalism & Reliability · Screen-Free Fun · Safety First

---

## Gallery (`gallery.html`)

### Hero

- **H1:** Our Event Gallery
- **Subcopy:** Relive laughter and unforgettable moments

### Main grid

- **H2:** Moments of Pure Joy and Connection
- **Description:** Birthdays to corporate, stories of fun and connection
- 9 captioned photos (`event-gallery-1` … `9`), captions in HTML

---

## Contact (`contact-us.html`)

### Hero

- **H1:** Let's Create Your Event!
- **Subcopy:** Weddings to corporate, design perfect game experience

### Form

- **H2:** Send Us a Message
- Fields: Name · Email · Interested Service (select) · Event Date · Message
- **Service options:** Wedding & Haldi · Sangeet & Cocktail · Corporate · Traditional · Bollywood · Other
- **CTA:** Submit Enquiry
- Client-side success message only (no backend)

### Contact info blocks

- Call Us (hours Mon-Sat 9-6 IST)
- Email Us
- Operational HQ, nationwide India, base Ahmedabad, travel to venue

### Map

Placeholder: “Event Coverage Area (India)”

### FAQs

None.

---

## Service detail pages (pattern)

Each of 8 services follows:

1. Hero slider (3 images) + H1 + subheadline
2. Intro H2 + 2 paragraphs
3. Selling points grid (6 items with icon, H4, text)
4. Photo grid (4 images)
5. Video section, **placeholder** `your-video-id`
6. Testimonial card
7. CTA block → Bubble or `index.html#contact`

Full per-service copy: **`src/data/services.json`**.

---

## Event types (cross-page)

Aggregated from services + contact form:

- Birthday (all ages)
- Corporate team building / summit / wellness
- Social: reunion, housewarming, friends
- Society / community festival
- School sports day / college fest / freshers / farewell
- Wedding: Haldi, Sangeet, Mehendi, reception, cocktail
- Traditional / nostalgia events
- Bollywood themed nights
- Custom / other (contact form)

---

## Content gaps for v2

| Gap                   | Action                                          |
| --------------------- | ----------------------------------------------- |
| Game library page     | Create content or remove CTA                    |
| Privacy policy        | Draft legal page                                |
| Home contact section  | Footer links `#contact` but no section on index |
| Real video embeds     | Replace YouTube placeholders                    |
| SEO meta descriptions | Not present on legacy: add per page            |
| FAQs                  | Optional new section (not in legacy)            |
| Unified phone number  | Use +91 9924007700                              |
