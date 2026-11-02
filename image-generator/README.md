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
`created_at`, `prompt`, `image_base64`, and `media_type`. The supplied
Compose file starts PostgreSQL but does not create this table. The table
is managed manually, not through repository migrations. Before deploying
the new code, apply this SQL locally and coordinate the production
change with Raphi:

```sql
ALTER TABLE generated_images ADD COLUMN image_url text, ADD COLUMN preview_url text;
ALTER TABLE generated_images ALTER COLUMN image_base64 DROP NOT NULL;
```

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
- Unmigrated images are temporarily excluded from the gallery. Migrate
  them before reopening the app after deployment.
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

## Migrate existing images

Do not run this against production without Raphi. Back up the table
before making production changes, using the intended database URL:

```sh
pg_dump "$DATABASE_URL" -t generated_images -Fc -f generated-images-backup.dump
```

After applying the additive SQL above, run from `image-generator/`:

```sh
npm run migrate:images
```

The script reads `.env.local` (existing environment variables take
precedence), requires a database URL and Blob token, and processes ten
legacy images at a time. It uses the same upload function as generation,
updates only rows with `image_url IS NULL`, and keeps Base64 intact for
verification. Already migrated rows are skipped, failures do not block
later images, and the final summary lists failed IDs with a nonzero exit
code. Rerun after fixing any failures; an interrupted run can resume. If
a process is killed between upload and database update, or an update's
outcome is unknown after a connection error, compare the logged Blob
URLs with the database before removing unreferenced blobs and retrying.
Run only one migration at a time.

Verify original and preview URLs and compare a few migrated originals
against the backup. This query must return zero before removing Base64:

```sql
SELECT count(*) FROM generated_images WHERE image_url IS NULL OR preview_url IS NULL;
```

Only after all images have been verified with Raphi (possibly a few days
later), apply:

```sql
ALTER TABLE generated_images ALTER COLUMN image_url SET NOT NULL;
ALTER TABLE generated_images ALTER COLUMN preview_url SET NOT NULL;
ALTER TABLE generated_images DROP COLUMN image_base64;
```

After dropping Base64, do not run the migration script again or roll
back to the Base64-based application without restoring the backup.

## Manual verification

1. Use the development database and Blob store, apply the additive SQL,
   then run `npm run dev` and generate an image. Check that the store
   has an original and WebP preview and the new row has both URLs with
   `image_base64` null.
2. In browser DevTools, verify generator and gallery images load from
   the Blob hostname, not a per-image API or Next's optimizer. Download
   an original and check its filename and image contents.
3. Migrate a few local legacy images and verify they appear in the
   gallery. Run the script again; it should report zero migrations.
4. Open a Blob URL in a private window: the image is public. The app
   still requires Basic Auth.
5. Generate an image and open the gallery without refreshing: it should
   appear immediately. Edit it with comments, confirm a new version is
   saved while the original remains, and test the transparent PNG
   download.
