import { isSessionValid } from "@/app/session";
import { fal } from "@fal-ai/client";
import { buildPrompt } from "@/app/style-template";

type FalImageResponse = {
  images: { url: string }[];
};

export async function POST(request: Request) {
  const body: unknown = await request.json();
  const authenticated = await isSessionValid();

  if (!authenticated) {
    return Response.json(
      { error: "Unauthorized", imageUrl: null },
      { status: 401 },
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("prompt" in body) ||
    typeof body.prompt !== "string"
  ) {
    return Response.json(
      { error: "Missing Prompt", imageUrl: null },
      { status: 400 },
    );
  }
  if (body.prompt.trim() === "") {
    return Response.json(
      { error: "Cant send without text", imageUrl: null },
      { status: 400 },
    );
  }
  const fullPrompt = buildPrompt(body.prompt);
  const falApiKey = process.env.FAL_KEY?.trim();
  if (!falApiKey) {
    return Response.json(
      { error: "App is not configured", imageUrl: null },
      { status: 500 },
    );
  }
  try {
    fal.config({ credentials: falApiKey });
    const result = await fal.subscribe(
      "openai/gpt-image-2.5/flare/text-to-image",
      {
        input: {
          prompt: fullPrompt,
          image_size: "landscape_16_9",
          quality: "high",
          num_images: 1,
          output_format: "png",
          sync_mode: false,
        },
      },
    );
    const data = result.data as FalImageResponse;
    const imageUrl = data.images[0].url;

    return Response.json({ error: null, imageUrl }, { status: 200 });
  } catch (error) {
    console.error("Image generation failed", error);
    return Response.json(
      { error: "Image generation failed", imageUrl: null },
      { status: 500 },
    );
  }
}
