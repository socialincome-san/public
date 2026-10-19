import { SectionHeading } from "@socialincome/design-system/layout/section-heading/section-heading";
import { Suspense } from "react";
import { GalleryLoadMore } from "./gallery-load-more";
import { getGalleryBatch } from "./gallery-database";
import { AppLoadingSkeleton } from "@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton";

const GalleryContent = async () => {
  const batch = await getGalleryBatch(0);
  return <GalleryLoadMore {...batch} />;
};

export default function ImagesPage() {
  return (
    <main className="max-w-content mx-auto w-full px-6 py-6 pb-24 sm:px-8">
      <div className="mb-8 flex flex-col items-start gap-2">
        <SectionHeading as="h1" size={3} align="left" bold>
          Generated Images
        </SectionHeading>
      </div>
      <Suspense fallback={<AppLoadingSkeleton />}>
        <GalleryContent />
      </Suspense>
    </main>
  );
}
