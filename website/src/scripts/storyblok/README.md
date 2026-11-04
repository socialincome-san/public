# Storyblok margin migration dry run

This runner performs a read-only Storyblok Management API export and
applies the committed offline margin migration engine to the exported
stories. It does not contain update, create, delete, publish, or
unpublish operations.

## Architecture and Data Model

The migration engine transforms block margin layout properties across
the 13 affected components (`marginTop` and `marginBottom`). In
Storyblok's schema, these are component-level layout controls rather
than localized text fields. The runner therefore operates on one
canonical story content tree per story.

The exporter captures:

1. **Space configuration**: Validates enabled languages from
   `GET /v1/spaces/:space_id`.
2. **Deterministic listing**: Enumerates stories using
   `GET /v1/spaces/:space_id/stories?sort_by=id:asc&page=...&per_page=...`,
   tracking `total` and `per_page` response headers and story identities
   (`id`, `uuid`, `slug`, `published`, `unpublished_changes`).
3. **Authoritative draft**: Fetches the working content via single-story
   retrieval `GET /v1/spaces/:space_id/stories/:story_id`.
4. **Authoritative published snapshot**:
   - For stories where
     `published === true && unpublished_changes === false`, the draft
     content is identical to the live published content.
   - For stories where
     `published === true && unpublished_changes === true`, the live
     published content differs from the draft. The runner attempts to
     fetch the published snapshot via the Content Delivery API
     (`cdn/stories/:id?version=published`). If no CDN token is provided
     or the snapshot cannot be verified, coverage is marked as
     incomplete (`completed-with-unproven-coverage`).
   - For stories where `published === false`, the story is draft-only.
5. **Publication safety rules**:
   - Only stories with
     `published === true && unpublished_changes === false` are marked
     for republishing (`publish: true`).
   - Stories with `unpublished_changes === true` are marked with
     `publish: false` in proposals to prevent publishing pending
     editorial drafts prematurely.
   - Draft-only stories retain `publish: false`.

The output directory defaults to the system temporary directory. Set
`STORYBLOK_MARGIN_MIGRATION_OUTPUT_DIR` to an explicit location outside
the repository when a durable review artifact is required. The runner
writes:

- `manifest.json`: retrieval metadata, identities, languages, page-level
  counts, publication status counts, failure details, explicit
  completion status, and snapshot hashes;
- `snapshots.json`: source story snapshots with draft and published
  hashes;
- `proposed-stories.json`: successfully transformed payloads with
  `publish` flags and pending change markers;
- `migration-report.json`: deterministic audit data from the migration
  engine.

## Fail-Closed Safety Gates

The runner requires both environment variables:

- `STORYBLOK_MARGIN_MIGRATION_ALLOW_LIVE_READ=1`
- `STORYBLOK_MARGIN_MIGRATION_COVERAGE_CONFIRMED=1`

All request methods are explicitly `GET`. Retries are bounded to three
attempts for 429, retryable 5xx responses, and transient network
failures. Output is serialized before a temporary sibling directory is
renamed into place. Existing output directories and repository-local
paths are rejected.

## Execution

From `website/`, after obtaining maintainer approval for a read-only
request:

```sh
STORYBLOK_MARGIN_MIGRATION_ALLOW_LIVE_READ=1 \
STORYBLOK_MARGIN_MIGRATION_COVERAGE_CONFIRMED=1 \
npx tsx src/scripts/storyblok/storyblok-margin-migration-dry-run.ts
```

Optionally provide `STORYBLOK_PREVIEW_TOKEN` (or
`STORYBLOK_PUBLIC_TOKEN`) if live published snapshot verification is
required for stories with unpublished draft changes.
