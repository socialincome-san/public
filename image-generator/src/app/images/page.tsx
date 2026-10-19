import { SectionHeading } from "@socialincome/design-system/layout/section-heading/section-heading";
import { Pool } from "pg";
import { ImageGallery, type GalleryImage } from "./image-gallery";

export const instant = false;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

type GalleryImageRow = Omit<GalleryImage, "created_at"> & {
  created_at: Date | null;
};

export default async function ImagesPage() {
  const result = await pool.query<GalleryImageRow>(
    "SELECT prompt, image_base64, media_type, created_at FROM generated_images ORDER BY created_at DESC NULLS LAST",
  );

  return (
    <main className="max-w-content mx-auto w-full px-6 py-6 pb-24 sm:px-8">
      <div className="mb-8 flex flex-col items-start gap-2">
        <SectionHeading as="h1" size={3} align="left" bold>
          Generated Images
        </SectionHeading>
      </div>
      <ImageGallery images={result.rows.map((image) => ({
        ...image,
        created_at: image.created_at?.toISOString() ?? null,
      }))} />
    </main>
  );
}
