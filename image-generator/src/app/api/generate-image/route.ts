import { generateImage } from "ai";
import { buildPrompt } from "@/app/style-template";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

type GeneratedImage = {
  base64: string;
  mediaType: string;
};

type PromptResult =
  { prompt: string; error: null } | { prompt: null; error: string };

export async function POST(request: Request) {
  const promptResult = await getPrompt(request);
  if (promptResult.error !== null) {
    return errorResponse(promptResult.error, 400);
  }

  try {
    const prompt = buildPrompt(promptResult.prompt);
    const image = await generateImageFile(prompt);

    await saveImageToDB(prompt, image);

    return Response.json(
      { error: null, imageBase64: image.base64, mediaType: image.mediaType },
      { status: 200 },
    );
  } catch (error) {
    console.error("Image generation failed", error);
    return errorResponse("Image generation failed", 500);
  }
}

const errorResponse = (error: string, status: number) =>
  Response.json({ error, imageBase64: null, mediaType: null }, { status });

const getPrompt = async (request: Request): Promise<PromptResult> => {
  try {
    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("prompt" in body) ||
      typeof body.prompt !== "string"
    ) {
      return { prompt: null, error: "Missing Prompt" };
    }

    const prompt = body.prompt.trim();
    return prompt === ""
      ? { prompt: null, error: "Cant send without text" }
      : { prompt, error: null };
  } catch {
    return { prompt: null, error: "Missing Prompt" };
  }
};

const generateImageFile = async (prompt: string): Promise<GeneratedImage> => {
  const { image } = await generateImage({
    model: "openai/gpt-image-2.5-flare",
    prompt,
    aspectRatio: "16:9",
    providerOptions: {
      openai: {
        quality: "high",
      },
    },
  });

  return { base64: image.base64, mediaType: image.mediaType };
};

const saveImageToDB = async (prompt: string, image: GeneratedImage) => {
  await pool.query(
    `INSERT INTO generated_images (prompt, image_base64, media_type, created_at)
     VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
    [prompt, image.base64, image.mediaType],
  );
};
