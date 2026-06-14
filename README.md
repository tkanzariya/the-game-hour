# The Game Hour (v2)

React + Vite + TypeScript rebuild for static deployment on Apache/cPanel shared hosting.

Legacy site (`../TheGameHour-legacy`) is reference only — do not modify it.

## Stack

- React 19 + Vite 8 + TypeScript
- Tailwind CSS v4
- React Router
- Framer Motion
- PHP Image CMS (production)
- ESLint + Prettier

## Scripts

| Command                | Description                              |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Local development server (React only)    |
| `npm run build`        | Production build → `dist/` (+ CMS copy)  |
| `npm run preview`      | Preview production build                 |
| `npm run lint`         | ESLint                                   |
| `npm run format`       | Prettier write                           |
| `npm run format:check` | Prettier check                           |

## Documentation

**Start here:** [docs/HANDBOOK.md](docs/HANDBOOK.md) — CMS access, content, booking, deploy, analytics.

| Area | Index |
| ---- | ----- |
| **Launch checklist** | [docs/DEPLOYMENT_RUNBOOK.md](docs/DEPLOYMENT_RUNBOOK.md) |
| Day-to-day operations | [docs/HANDBOOK.md](docs/HANDBOOK.md) |

Design tokens: `src/styles/design-tokens.ts` (source of truth) + `src/styles/tokens.css`.

Claymorphism skill: [../SKILL.md](../SKILL.md)

## Project structure

```
src/
├── animations/   # Framer Motion variants
├── assets/       # Bundled images (CMS overrides at runtime)
├── components/   # Reusable UI
├── data/         # Static content & config
├── layouts/      # Route layouts
├── pages/        # Route pages
├── sections/     # Page sections
└── styles/       # globals.css, design tokens

cms/              # PHP Image CMS (copied to dist/ on build)
docs/             # Operational documentation
archive/          # Historical phase reports
```

See [docs/operations/PROJECT_STRUCTURE.md](docs/operations/PROJECT_STRUCTURE.md) for details.

## Deploy (Apache/cPanel)

**Full launch checklist:** [docs/DEPLOYMENT_RUNBOOK.md](docs/DEPLOYMENT_RUNBOOK.md)

1. Run `npm run build`
2. Upload **contents of `dist/`** to your web root (e.g. `public_html`)
3. Configure CMS on server (database + `config.php`) — steps in runbook
4. Ensure `.htaccess` is present in the deploy root (Vite copies it from `public/`)

`vite.config.ts` uses `base: './'` so assets resolve correctly on shared hosting and in subdirectories.

## Path alias

`@/` → `src/` (e.g. `import { colors } from '@/styles/design-tokens'`)
