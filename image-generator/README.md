# Image Generator

Next.js app for generating Social Income watercolor illustrations and
browsing previously generated images. Uses the existing AI SDK,
PostgreSQL, Vercel Blob, Sharp, and shared design system.

## Setup

Install dependencies from the repository root with `npm ci`. Run the
commands below from `image-generator/`.

Configure `.env.local` with `DATABASE_URL`, `APP_PASSWORD`,
`AI_GATEWAY_API_KEY` for the AI SDK gateway, `BLOB_READ_WRITE_TOKEN`,
and `BLOB_HOSTNAME` (the exact store hostname, without `https://` or a
path). Never commit credentials.

Create a **public** Vercel Blob store under the project's Storage tab
and connect it to the Image Generator project. Vercel adds
`BLOB_READ_WRITE_TOKEN` automatically; add `BLOB_HOSTNAME` for each
environment. Ask Raphi if you do not have access. Use a separate public
development store locally so test uploads never reach production. Anyone
with a Blob URL can view the image without authentication; this is
intentional for the future public website gallery. Random URL suffixes
prevent predictable filenames. The app and APIs remain behind Basic
Auth.

An existing `generated_images` table is required, with `id`,
`created_at`, `prompt`, `media_type`, `image_url`, `preview_url`,
`status`, and `cost_usd`. Every image needs an original and preview URL.
The supplied Compose file starts PostgreSQL but does not create this
table. The table is managed manually; coordinate schema changes with
Raphi.

Apply `migrations/add-image-status.sql` once to the existing database
before deploying this version. Existing images remain active; deleting
one only sets its status to `deleted` and hides it from the gallery.

Apply `migrations/add-image-cost.sql` once before deploying image cost
badges. New images store the AI Gateway's reported USD cost; existing
images have no recorded cost and show an unavailable badge.

Start the app with `npm run dev` and open http://localhost:3000. Basic
Auth accepts any username and checks the configured password.

## Implementation

- `src/lib/` holds the logic: `prompts.ts` (all prompt text),
  `image-generation.ts` (model call, size check, save),
  `style-references.ts`, `countries.ts`, `image-formats.ts`,
  `image-comments.ts`, `paper-cutout.ts` and `database.ts` (PostgreSQL
  pool and queries). Routes in `src/app/api` validate input and call it.
- `src/lib/image-storage.ts` uploads the original and an 800px WebP
  preview (fit inside, quality 75) to the public Blob store once. Both
  have random suffixes and a one-year cache lifetime. The database
  stores only `image_url`, `preview_url`, and metadata for new images.
  Failed preview uploads remove the original; confirmed SQL statement
  rejections remove both blobs. If a connection error leaves the write
  outcome unknown, blobs are retained and their URLs logged. Check the
  database before removing any of them. Cleanup failures log the orphan
  URLs for manual removal.
- Both `POST /api/generate-image` (multipart: prompt, format, country,
  optional reference) and `POST /api/edit-image` (JSON: image id and
  comments) answer
  `{ image: { id, imageUrl, previewUrl, width, height, ...metadata } }`
  or `{ error }`.
- Gallery previews and generator/edit originals load directly from the
  Blob CDN with Next's optimizer disabled. Original downloads append
  `?download=1` to the Blob URL, since HTML's `download` attribute alone
  does not work across domains.
- `/api/gallery-images/[id]?variant=transparent` fetches the Blob
  original and removes its paper background. `&download=1` makes it an
  attachment. Preview and original variants are removed.
- `/images` server-renders the first batch of 24. Load more fetches
  `/api/gallery-images?after=<id of the last shown image>`; the cursor
  keeps batches stable while new images are saved. Versions made in the
  gallery's edit dialog are added at the top without a reload. The
  gallery shows only the user's part of each saved prompt
  (`extractUserInput`).
- `GET /api/gallery` returns all active images, newest first, as
  `{ images: [{ id, prompt, previewUrl, imageUrl, costUsd, createdAt }] }`.
  Prompts contain only the user's input, as in the gallery. The endpoint
  is protected by the same Basic Auth as the app and sends
  `Cache-Control: private, no-store`; the website caches the list on its
  server. Preview URLs point to the public Blob CDN and do not require
  authentication.
- The website and Image Generator use the same design-system
  `ImageGallery`. Optional image metadata and action/overlay slots
  determine what it shows. The generator supplies its existing edit,
  download and delete controls; the public website shows creation time,
  costs and prompts with original downloads only, but no edit or delete
  controls. The website initially displays 24 images. Its optional
  gallery pagination reveals another 24 per click from the server-cached
  list without API requests.
- Website downloads use the public Blob URL directly and do not trigger
  background removal. Visitors never enter a password. Configure
  `IMAGE_GENERATOR_URL` and `IMAGE_GENERATOR_PASSWORD` in the website's
  server environment, never as `NEXT_PUBLIC_*` variables. Deploy the
  generator's gallery API with `imageUrl` before the website so original
  downloads are available.
- Enter submits the prompt; Shift+Enter inserts a newline. Navigation
  preserves page state through Next.js Cache Components.
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

The edit route looks up the stored URL by id, fetches the Blob original,
and sends the clean original plus a separate numbered location guide.
The guide marks each comment's exact image position with a crosshair;
the prompt also includes its percentage and original-image pixel
location. It keeps the original size, saves the result as a new gallery
image and never overwrites the source. The dialog then shows the new
version for further rounds. The prompt asks to keep everything else;
this is not a pixel-level guarantee.

## Session version history

Each successful generation or edit adds a thumbnail in the generator.
The gallery's edit dialog also shows a thumbnail for its original and
each edit made in that dialog. Select an older version to edit it again;
this adds a new one without removing later versions. All images are
saved independently in the gallery. History lasts only for the current
page session; version relationships are not stored in the database.

## Transparent download

The download menu offers the original and a PNG with a transparent
background. `src/lib/paper-cutout.ts` removes the white paper with
Sharp, no AI involved. It takes about half a second for 1024×1024 and
runs in a worker thread, so other requests are not blocked. It removes
paper connected to the border, enclosed gaps and slivers between hair
strands, but only when they are as bare as the paper. Painted white,
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

## Manual verification

1. Use the development database and Blob store, then run `npm run dev`
   and generate an image. Check that the store has an original and WebP
   preview and the new database row has both URLs.
2. In browser DevTools, verify generator and gallery images load from
   the Blob hostname, not a per-image API or Next's optimizer. Download
   an original and check its filename and image contents.
3. Open a Blob URL in a private window: the image is public. The app
   still requires Basic Auth.
4. Generate an image and open the gallery without refreshing: it should
   appear immediately. Edit it with comments, confirm a new version is
   saved while the original remains, and test the transparent PNG
   download.
