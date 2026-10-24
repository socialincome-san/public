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
- Every request sends eight randomly picked illustrations from
  `src/style-references/scenes/` as style references, plus the user's
  optional reference image first. Add or remove approved illustrations
  there to change the style (1024 px JPEGs).
- The country select adds typical local details from
  `src/lib/countries.ts` so scenes look specific to Sierra Leone,
  Liberia or Ghana. "Global" keeps the setting generic for contributors
  anywhere in the world and picks its references from
  `src/style-references/light-skin/` instead.
- `src/lib/database.ts` owns the PostgreSQL pool and image queries.
- `/images` server-renders the first metadata batch. The load-more
  button fetches `/api/gallery-images?offset=24` and subsequent batches
  of 24.
- `/api/gallery-images/[id]` generates an 800px WebP preview on demand.
  Previews are cached privately in the browser for one day, not stored
  in the database. Authenticated images bypass Next's image optimizer.
- `?download=1` serves the stored original as an attachment.
  `?download=1&transparent=1` removes the white paper on the fly
  (`src/lib/paper-cutout.ts`) and serves a transparent PNG. The
  generator and the gallery offer both through the same download menu;
  the generate response returns the saved image id for this.
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

## Reference images

Reference images are optional. Upload a JPEG, PNG, or WebP up to 10 MB
and 40 megapixels, then use the prompt to request a watercolor
transformation or describe how to use the image as inspiration. The
generator sends the prompt, ratio, and file as multipart `FormData`. The
server validates and decodes the image, removes metadata, normalizes
orientation, and passes its bytes through the AI SDK's `prompt.images`
to the existing GPT Image 2.5 Flare model. References are not stored in
the gallery; only the generated result is saved. Remove the reference to
return to text-only generation.

## Checks

```sh
npm run lint
npm run typecheck
npm run format:check
npm run check:unused
npm run build
```
