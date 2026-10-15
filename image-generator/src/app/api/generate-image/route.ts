import { generateImage } from "ai";
import { isSessionValid } from "@/app/session";
import { buildPrompt } from "@/app/style-template";

export async function POST(request: Request) {
  const body: unknown = await request.json();
  const authenticated = await isSessionValid();

  if (!authenticated) {
    return Response.json(
      { error: "Unauthorized", imageBase64: null, mediaType: null },
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
      { error: "Missing Prompt", imageBase64: null, mediaType: null },
      { status: 400 },
    );
  }
  if (body.prompt.trim() === "") {
    return Response.json(
      { error: "Cant send without text", imageBase64: null, mediaType: null },
      { status: 400 },
    );
  }
  const fullPrompt = buildPrompt(body.prompt);

  try {
    const { image } = await generateImage({
      model: "openai/gpt-image-2.5-flare",
      prompt: fullPrompt,
      aspectRatio: "16:9",
      providerOptions: {
        openai: {
          quality: "high",
        },
      },
    });
    return Response.json(
      { error: null, imageBase64: image.base64, mediaType: image.mediaType },
      { status: 200 },
    );
  } catch (error) {
    console.error("Image generation failed", error);

    return Response.json(
      { error: "Image generation failed", imageBase64: null, mediaType: null },
      { status: 500 },
    );
  }
}
