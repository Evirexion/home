# E-VIREXION — Website

Premium electric-mobility magazine for Colombia & Latin America. Next.js (App Router) + Tailwind v4, deployed to Cloudflare Workers via OpenNext, content managed in Sanity.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind v4)
- **Sanity** — headless CMS for News/Innovations posts, charging stations, and vehicle price entries. Editable without redeploying the site.
- **Cloudflare Workers** — deploy target, via `@opennextjs/cloudflare` (the current recommended path for Next.js on Cloudflare; supports Node APIs, unlike the older edge-only `next-on-pages` adapter)
- **Leaflet / react-leaflet** — charging station map (OpenStreetMap tiles, no API key required)
- **Recharts** — price charts

## Project structure

```
src/
  app/
    (site)/            # public site, wrapped in Header + Footer
      page.tsx          # homepage
      map/              # charging station map
      news/             # CORRIENTE (public news)
        internal/        # password-protected draft/submit view
        [slug]/
      innovations/
        [slug]/
      prices/           # calculator + browse
      contact/          # Contáctanos form, routes by motivo to a team inbox
    api/                # route handlers (internal auth, news submissions)
    studio -> see /studio (separate project, not part of this app)
  components/           # ui/, layout/, home/, map/, news/, prices/, icons/
  data/                 # mock datasets (posts, stations, vehicle prices)
  lib/                  # data-fetching (Sanity-first, mock-data fallback)
  types/                # shared content types
studio/                 # standalone Sanity Studio (own package.json)
```

### Why mock data still exists once Sanity is connected

Every `lib/*.ts` fetch function checks whether `NEXT_PUBLIC_SANITY_PROJECT_ID` is set. If it isn't, it serves the bundled mock data from `src/data/`; once you connect a real Sanity project, the same functions transparently switch to live queries — no UI code changes needed.

## Local development

```bash
npm install
npm run dev
```

Runs entirely on mock data with no environment variables required.

## Connecting Sanity

1. `cd studio && npm install`
2. `npx sanity init` (or manually create a project at [sanity.io/manage](https://www.sanity.io/manage)) — choose "Use existing configuration" so it picks up `sanity.config.ts` and the schemas in `schemaTypes/`.
3. Set `SANITY_STUDIO_PROJECT_ID` / `SANITY_STUDIO_DATASET` (studio env) and, in the **root** project, copy `.env.example` to `.env.local` and set the matching `NEXT_PUBLIC_SANITY_PROJECT_ID` / `NEXT_PUBLIC_SANITY_DATASET`.
4. `npm run dev` (inside `studio/`) to run Sanity Studio locally at `localhost:3333`, or `npm run deploy` to publish it to a free `your-project.sanity.studio` URL — this is entirely separate from the Cloudflare deploy of the main site.
5. Create a write-access API token (Manage → API → Tokens) and set it as `SANITY_API_WRITE_TOKEN` in the root project — this is what lets the internal news form create draft documents.
6. Content types: `post` (News/Innovations, distinguished by `category`), `station` (charging stations, with `country`/`city`/`zone`), `vehicleListing` (price guide entries). Seed a few and the site will start reading live content automatically.

## Internal news draft area

`/news/internal` is gated by a single shared password (`INTERNAL_NEWS_PASSWORD` env var) rather than per-user accounts, per the brief ("simple password-protected"). Submissions are written to Sanity as `status: "pending"` posts — a real editor still needs to review and flip them to `"published"` in Sanity Studio before they appear on the public feed.

## Replacing mock data with real data

- **Charging stations**: once Sanity is connected, add/edit `station` documents directly in the Studio — no code or redeploy needed. `src/data/stations.ts` is a dev-only fallback with real Bogotá data; other cities/countries can be added the same way once verified.
- **Vehicle prices**: `src/data/vehicles.ts` is generated from the team's master Google Sheet (brand/model/spec/suggested price range) — it's real data, not synthetic. Re-run the same import against the updated sheet to refresh it, or manage `vehicleListing` documents directly in Sanity once connected.

## Contact form (Contáctanos)

`/contact` submits via a Server Action (`src/app/(site)/contact/actions.ts`) that calls the [Resend](https://resend.com) REST API directly with `fetch` — no SDK dependency. Set `RESEND_API_KEY` (and optionally `CONTACT_FROM_EMAIL`, which must be on a domain verified in Resend) for submissions to actually deliver; without it, the form shows a clear "not configured yet" error instead of failing silently. The "Motivo" dropdown routes each message to a different inbox (`src/lib/contact.ts`):

| Motivo | Destino |
| --- | --- |
| Publicidad y alianzas | publicidad@evirexion.com |
| Talleres y estaciones de carga | talleres@evirexion.com |
| Prensa y negocios | gerencia@evirexion.com |
| Otro / Comentarios generales | contacto@evirexion.com |

## Deploying to Cloudflare

```bash
npm run deploy   # builds with OpenNext and deploys via Wrangler
npm run preview  # local production preview through Wrangler
```

`wrangler.jsonc` defines the Worker (`e-virexion`), static assets, and a Cloudflare Images binding used for `next/image` optimization. First-time deploys will need `npx wrangler login`.

## Brand tokens

Defined in `src/app/globals.css`: `--color-ink` (#0A0C0B), `--color-electric` (#00FF41), `--color-teal` (#1D9E75), `--color-mint` (#4FFFB0), plus a silver scale for metallic text. Headings use Space Grotesk, body text uses Inter (both via `next/font/google`).

The hero wordmark (`src/components/ui/Logo.tsx`) is a CSS/SVG approximation of the real chrome/metallic logo — drop the real brand files into `/public/brand` and swap the component markup once available.
