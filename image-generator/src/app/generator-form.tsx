"use client";

import { Button } from "@socialincome/design-system/actions/button/button";
import { Textarea } from "@socialincome/design-system/forms/textarea/textarea";
import { useState } from "react";
import Image from "next/image";

type GenerateResponse = {
  error: string | null;
  imageBase64: string | null;
  mediaType: string | null;
};
export function GeneratorForm() {
  const [error, setError] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const prompt = formData.get("prompt");
    const response = await fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const json = (await response.json()) as GenerateResponse;
    setError(json.error);
    setImageBase64(json.imageBase64);
    setMediaType(json.mediaType);
    setIsPending(false);
  };

  const handleDownload = async () => {
    if (!imageBase64 || !mediaType) {
      return;
    }
    const response = await fetch("/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64, mediaType }),
    });
    if (!response.ok) {
      setError("Download failed");
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "image.png";
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const imageSrc =
    imageBase64 && mediaType ? `data:${mediaType};base64,${imageBase64}` : null;

  return (
    <form
      className="mt-8 flex w-full flex-col items-center sm:mt-10"
      onSubmit={handleSubmit}
    >
      {error && <p className="text-destructive mb-4 text-sm font-medium">{error}</p>}
      <Textarea
        name="prompt"
        placeholder="Beschreibe dein Bild ..."
        rows={6}
      />
      <div className="mt-8 flex justify-center">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Generating..." : "Generate"}
          <span aria-hidden="true">→</span>
        </Button>
      </div>
      {isPending && (
        <div className="mt-6 flex w-full flex-col items-center gap-3">
          <p className="text-muted-foreground text-sm">
            Generating your image, this can take up to a minute...
          </p>
          <div className="bg-muted h-2 w-full max-w-xl overflow-hidden rounded-full">
            <div className="bg-primary h-full w-1/3 animate-pulse rounded-full"></div>
          </div>
        </div>
      )}
      {imageSrc && (
        <div className="mt-10 flex flex-col items-center gap-6">
          <Image
            src={imageSrc}
            width={1920}
            height={1080}
            alt="Generated"
            className="h-auto w-full max-w-xl rounded-2xl shadow-card"
          />
          <Button type="button" variant="outline" size="md" onClick={handleDownload}>
            Download PNG
          </Button>
        </div>
      )}
    </form>
  );
}
