import { isSessionValid } from "../session";
import { Pool } from "pg";
import Image from "next/image";
import { redirect } from "next/navigation";
export const instant = false;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
type GeneratedImageRow = {
  image_base64: string;
  media_type: string;
};
export default async function ImagesPage() {
  if (!(await isSessionValid())) {
    redirect("/");
  }
  const result = await pool.query<GeneratedImageRow>(
    "SELECT image_base64, media_type FROM generated_images",
  );
  return (
    <main className="mx-auto w-full max-w-6xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Generated Images</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {result.rows.map((image) => (
          <Image
            key={image.image_base64}
            src={`data:${image.media_type};base64,${image.image_base64}`}
            width={1920}
            height={1080}
            alt="Generated"
            className="h-auto w-full rounded-lg"
            unoptimized
          />
        ))}
      </div>
    </main>
  );
}
