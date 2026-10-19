import { SectionHeading } from "@socialincome/design-system/layout/section-heading/section-heading";
import { Suspense } from "react";
import { ImageGallery, type GalleryImage } from "./image-gallery";
import { GalleryPagination } from "./gallery-pagination";
import { galleryPool } from "./gallery-database";

type GalleryImageRow = Omit<GalleryImage, "created_at"> & {
  created_at: Date | null;
};

type SearchParams = Promise<{ page?: string | string[]; size?: string | string[] }>;

const GalleryContent = async ({ searchParams }: { searchParams: SearchParams }) => {
  const params = await searchParams;
  const requestedSize = Number(params.size);
  const pageSize = [12, 24, 36].includes(requestedSize) ? requestedSize : 12;
  const requestedPage = Number(params.page);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 && requestedPage <= 1000000 ? requestedPage : 1;
  const result = await galleryPool.query<GalleryImageRow>(
    "SELECT id, prompt, media_type, created_at FROM generated_images ORDER BY created_at DESC NULLS LAST, id DESC LIMIT $1 OFFSET $2",
    [pageSize + 1, (page - 1) * pageSize],
  );

  return (
    <>
    <ImageGallery key={`${page}-${pageSize}`} images={result.rows.slice(0, pageSize).map((image) => ({
      ...image,
      created_at: image.created_at?.toISOString() ?? null,
    }))} />
    <GalleryPagination page={page} pageSize={pageSize} hasNextPage={result.rows.length > pageSize} />
    </>
  );
};

export default function ImagesPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="max-w-content mx-auto w-full px-6 py-6 pb-24 sm:px-8">
      <div className="mb-8 flex flex-col items-start gap-2">
        <SectionHeading as="h1" size={3} align="left" bold>
          Generated Images
        </SectionHeading>
      </div>
      <Suspense fallback={null}>
        <GalleryContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
