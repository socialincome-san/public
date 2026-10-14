"use client";

import { Button } from "@socialincome/design-system/actions/button/button";
import { Textarea } from "@socialincome/design-system/forms/textarea/textarea";
import { useState } from "react";
import Image from "next/image";

type GenerateResponse = { error: string | null; imageUrl: string | null };

export function GeneratorForm() {
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
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
    setImageUrl(json.imageUrl);
    setIsPending(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="text-destructive text-sm">{error}</p>}
      <Textarea name="prompt" />
      <Button type="submit" disabled={isPending}>
        {isPending ? "Generating..." : "Generate"}
      </Button>
      {isPending && (
        <>
          <p className="text-muted-foreground text-sm">
            Generating your image, this can take up to a minute...
          </p>
          <div className="bg-muted h-2 w-full max-w-xl overflow-hidden rounded-full">
            <div className="bg-primary h-full w-1/3 animate-pulse rounded-full"></div>
          </div>
        </>
      )}
      {imageUrl && (
        <>
          <Image
            src={imageUrl}
            width={1920}
            height={1080}
            alt="Generated"
            className="h-auto w-full max-w-xl rounded-lg shadow-lg"
          />
          <a href={`/download?url=${encodeURIComponent(imageUrl)}`}>
            Download PNG
          </a>
        </>
      )}
    </form>
  );
}
