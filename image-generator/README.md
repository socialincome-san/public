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

Start the app with `npm run dev` and open http://localhost:3000. Basic
Auth accepts any username and checks the configured password.

## Implementation

- `src/app/api/generate-image/route.ts` validates the prompt, generates
  an image with the fixed watercolor style, and saves it before
  returning.
- `src/lib/database.ts` owns the PostgreSQL pool and image queries.
- `src/lib/image-storage.ts` uploads the original and an 800px WebP
  preview (fit inside, quality 75) to the public Blob store once. Both
  have random suffixes and a one-year cache lifetime. The database
  stores only `image_url`, `preview_url`, and metadata for new images.
  Failed preview uploads remove the original; confirmed SQL statement
  rejections remove both blobs. If a connection error leaves the write
  outcome unknown, blobs are retained and their URLs logged. Check the
  database before removing any of them. Cleanup failures log the orphan
  URLs for manual removal.
- `/images` server-renders the first metadata batch. The load-more
  button fetches `/api/gallery-images?offset=24` and subsequent batches
  of 24.
- Gallery previews and generator originals load directly from the Blob
  CDN with Next's optimizer disabled. The old per-image preview/original
  API route is removed. Original downloads append `?download=1` to the
  Blob URL, since HTML's `download` attribute alone does not work across
  domains.
- Unmigrated images are temporarily excluded from the gallery. Migrate
  them before reopening the app after deployment.
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

The edit dialog and transparent-download route mentioned in issue #3308
are not present in this checkout. When those features are added, they
must fetch the stored `imageUrl` rather than read Base64, and edits must
reuse `saveImage` without overwriting the old image.
