# Image Generator

Next.js app for generating Social Income watercolor illustrations and
browsing previously generated images. Uses the existing AI SDK,
PostgreSQL, Sharp, and shared design system.

## Setup

Install dependencies from the repository root with `npm ci`. Run the
commands below from `image-generator/`.

Configure `.env.local` with `DATABASE_URL`, `APP_PASSWORD`, and
`AI_GATEWAY_API_KEY` for the AI SDK gateway. Never commit credentials.
An existing `generated_images` table is required, with `id`,
`created_at`, `prompt`, `image_base64`, and `media_type`. The supplied
Compose file starts PostgreSQL but does not create this table.

Start the app with `npm run dev` and open http://localhost:3000. Basic
Auth accepts any username and checks the configured password.

## Implementation

- `src/app/api/generate-image/route.ts` validates the prompt, generates
  an image with the fixed watercolor style, and saves it before
  returning.
- `src/lib/database.ts` owns the PostgreSQL pool and image queries.
- `/images` server-renders the first metadata batch. The load-more
  button fetches `/api/gallery-images?offset=24` and subsequent batches
  of 24.
- `/api/gallery-images/[id]` generates an 800px WebP preview on demand.
  Previews are cached privately in the browser for one day, not stored
  in the database. Authenticated images bypass Next's image optimizer.
- `?download=1` serves the stored original as an attachment. The
  generator downloads its already-returned image through a native
  download link.
- Enter submits the prompt; Shift+Enter inserts a newline. Navigation
  preserves page state through Next.js Cache Components.
- The format selector defaults to square and supports 1:1, 16:9, 9:16,
  4:3, 3:4, and 3:2. GPT Image 2.5 Flare supports all six natively via
  custom pixel sizes, passed through the AI SDK's `size` option.
  Dimensions are multiples of 16 and within the provider's pixel limits
  ([provider documentation](https://developers.openai.com/api/docs/guides/image-generation#size-and-quality-options)).
  The API rejects unsupported ratios and mismatched output instead of
  silently cropping or stretching. Actual image dimensions are returned
  for the generated preview; the gallery and download keep the original.

## Checks

```sh
npm run lint
npm run typecheck
npm run format:check
npm run check:unused
npm run build
```
