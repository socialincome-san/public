export async function POST(request: Request) {
  const body: unknown = await request.json();
  if (
    typeof body !== "object" ||
    body === null ||
    !("imageBase64" in body) ||
    typeof body.imageBase64 !== "string" ||
    !("mediaType" in body) ||
    typeof body.mediaType !== "string"
  ) {
    return new Response("Invalid image data", { status: 400 });
  }
  const imageBytes = Buffer.from(body.imageBase64, "base64");

  return new Response(imageBytes, {
    headers: {
      "Content-Type": body.mediaType,
      "Content-Disposition": 'attachment; filename="image.png"',
    },
  });
}
