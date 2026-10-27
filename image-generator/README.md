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

- `src/lib/` holds the logic: `prompts.ts` (all prompt text),
  `image-generation.ts` (model call, size check, save),
  `style-references.ts`, `countries.ts`, `image-formats.ts`,
  `image-comments.ts`, `paper-cutout.ts` and `database.ts` (PostgreSQL
  pool and queries). Routes in `src/app/api` validate input and call it.
- Both `POST /api/generate-image` (multipart: prompt, format, country,
  optional reference) and `POST /api/edit-image` (JSON: image id and
  comments) answer `{ image: { id, width, height } }` or `{ error }`.
  The client shows images through `imageUrl()` in `src/lib/images.ts`.
- `/api/gallery-images/[id]` serves `?variant=preview` (default, an
  800px WebP made on demand), `original` or `transparent`; `&download=1`
  makes it an attachment. Responses are cached privately in the browser
  for one day, nothing extra is stored. Authenticated images bypass
  Next's image optimizer.
- `/images` server-renders the first batch of 24. Load more fetches
  `/api/gallery-images?offset=24` and so on; images that arrive twice
  after an edit are shown once. The gallery shows only the user's part
  of each saved prompt (`extractUserInput`).
- Enter submits the prompt; Shift+Enter inserts a newline.
- The format select defaults to square and offers 1:1, 4:5, 9:16, 16:9,
  4:3, 3:2 and 3:4, labelled by platform. Sizes are custom pixel sizes
  passed through the AI SDK's `size` option, multiples of 16 within the
  provider's limits
  ([provider documentation](https://developers.openai.com/api/docs/guides/image-generation#size-and-quality-options)).
  The API rejects output that does not match instead of cropping.

## Style references and countries

Every generation sends 8 randomly picked approved Social Income
illustrations from `src/style-references/` as style references to GPT
Image 2.5 Sunburst. A fresh subset per image keeps one reference from
dominating. `next.config.ts` traces the folder into the generate route.

The country select (Sierra Leone, Liberia, Ghana, Global) adds typical
local details from `src/lib/countries.ts` to the prompt and picks the
reference set: `west-africa/` for the three countries, `global/` (light
skin, no landmarks) for Global. The country details are a draft and
still need checking by people who know the countries.

## Reference images

Reference images are optional. Upload a JPEG, PNG, or WebP up to 10 MB
and 40 megapixels. The server validates it, removes metadata, normalizes
orientation and sends it before the style references; the prompt marks
it as a content reference for subject and composition, not for style.
References are not stored, only the result is.

## Editing with comments

**Edit** in the generator or on a gallery card opens a large dialog with
the original image. Click (or press Enter on) the image to add a
numbered comment, drag a pin or move it with the arrow keys, and
describe each change. Up to 20 comments of 2,000 characters.

The edit route loads the stored image by id, so nothing is uploaded, and
sends it with a prompt that lists each change with its position in
percent of the image. It keeps the original size, saves the result as a
new gallery image and never overwrites the source. The dialog then shows
the new version for further rounds. The prompt asks to keep everything
else; this is not a pixel-level guarantee.

## Transparent download

The download menu offers the original and a PNG with a transparent
background. `src/lib/paper-cutout.ts` removes the white paper with
Sharp, no AI involved. It takes about half a second for 1024×1024 and
runs in a worker thread, so other requests are not blocked. Removed are
paper connected to the border, enclosed gaps and slivers between hair
strands go, but only when they are as bare as the paper. Painted white,
such as a white shirt, has brushwork and stays. Outlines get a soft edge
coloured from the painted pixels inside. The thresholds are tuned to the
current style on white paper.

## Checks

```sh
npm run lint
npm run typecheck
npm run test:unit
npm run format:check
npm run check:unused
npm run build
```
