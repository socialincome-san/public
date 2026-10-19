import { SectionHeading } from "@socialincome/design-system/layout/section-heading/section-heading";
import { Pool } from "pg";
import { ImageGallery, type GalleryImage } from "./image-gallery";

export const instant = false;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function ImagesPage() {
  const result = await pool.query<GalleryImage>(
    "SELECT prompt, image_base64, media_type FROM generated_images",
  );

  return (
    <main className="max-w-content mx-auto w-full px-6 py-6 pb-24 sm:px-8">
      <div className="mb-8 flex flex-col items-start gap-2">
        <SectionHeading as="h1" size={3} align="left" bold>
          Generated Images
        </SectionHeading>
        <p className="text-muted-foreground text-sm sm:text-base">
          Klicke auf ein Bild, um den User Prompt und den Base Prompt anzusehen.
        </p>
      </div>
      <ImageGallery images={result.rows} />
    </main>
  );
}
