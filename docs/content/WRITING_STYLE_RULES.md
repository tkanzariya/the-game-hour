# The Game Hour: Writing Style Rules

**Applies to:** All user-facing copy, JSON content, SEO metadata, reports, and AI-generated text in `TheGameHour-v2/`.

---

## Forbidden punctuation

Do **not** use these characters in copy or comments that describe user-facing text:

| Character | Name | Unicode |
|-----------|------|---------|
| `—` | Em dash | U+2014 |
| `–` | En dash | U+2013 |
| `―` | Horizontal bar | U+2015 |

**Exception:** Hyphen-minus `-` (U+002D) is allowed for compound words, numeric ranges (`12-16px`), and minus signs.

---

## Preferred punctuation

| Situation | Use |
|-----------|-----|
| Two related clauses | Comma `,` or period `.` |
| List introduction | Colon `:` |
| Page / SEO title separator | Pipe `\|` (e.g. `The Game Hour \| Screen-Free Event Games`) |
| Subtitle or aside | Parentheses `()` |
| Numeric or CSS ranges | Hyphen `-` (e.g. `400-800`, `64-96px`) |
| Optional rewrite | Full sentence instead of a dash break |

### Examples

| Avoid | Prefer |
|-------|--------|
| Premium experiences — unforgettable memories | Premium experiences for unforgettable memories |
| Book now — limited slots | Book now. Limited slots available. |
| Gujarat — facilitator-led | Gujarat: facilitator-led games |
| The Game Hour — Screen-Free | The Game Hour \| Screen-Free |

---

## Tone guidelines

1. **Human and direct.** Write like a friendly event host, not a SaaS landing page.
2. **Concise.** Short sentences beat long stacked clauses.
3. **Concrete.** Name event types, cities, and outcomes guests care about.
4. **Playful but premium.** Warm energy without slang overload or hype clichés.
5. **Avoid AI tells:** em dashes, "delve," "tapestry," "elevate," "landscape," "unlock," "seamless," excessive superlatives.

---

## SEO and metadata

- **Title format:** `{Page topic} | The Game Hour` or `{SITE.name} | {Descriptor}`.
- **Descriptions:** Plain sentences, no dash separators. Include location (Gujarat) and service keywords naturally.
- **Alt text:** `{Subject} | The Game Hour` or `{Subject}: {short context}`.

---

## JSON and content files

- All strings in `src/data/*.json` must follow these rules.
- When migrating legacy copy, rewrite awkward comma splices left after dash removal.
- Prefer colons before lists; commas between list items.

---

## Code comments and internal docs

- Technical reports may use colons in headings: `## Task 1: Dropdown fix` (not `Task 1 — Dropdown`).
- Code comments: use `:` or `-` for bullet-style notes, not em dashes.

---

## Future content generation (agents and humans)

Before committing copy:

1. Search changed files for `—`, `–`, `―`.
2. Run `node scripts/cleanup-dashes.mjs` if bulk cleanup is needed (excludes `node_modules` and `dist`).
3. Rebuild and spot-check hero, services, and SEO titles in the browser.
4. Read aloud: if a comma splice sounds wrong, rewrite the sentence.

**Regenerate `dist/`** after copy changes (`npm run build`). Do not edit `dist/` by hand.

---

## Reference

- Cleanup script: `scripts/cleanup-dashes.mjs`
- Dash cleanup audit log removed; standards live in this file (see git history).
