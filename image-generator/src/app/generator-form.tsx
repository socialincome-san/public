"use client";

import { Button } from "@socialincome/design-system/actions/button/button";
import { AnimatedSILogoIcon } from "@socialincome/design-system/brand/logo/logo";
import { Textarea } from "@socialincome/design-system/forms/textarea/textarea";
import { SectionHeading } from "@socialincome/design-system/layout/section-heading/section-heading";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type GenerateResponse = {
  error: string | null;
  imageBase64: string | null;
  mediaType: string | null;
};

const showcaseImages = [
  {
    alt: "A family planting a seedling together",
    className: "-rotate-3 sm:top-[13%] sm:left-[5%] sm:w-[26%] sm:-rotate-6",
    src: "/images/showcase/planting.png",
  },
  {
    alt: "Children running through their village",
    className: "rotate-2 sm:top-0 sm:left-[28%] sm:z-20 sm:w-[26%] sm:-rotate-2",
    src: "/images/showcase/children-running.png",
  },
  {
    alt: "A mother reading with two children",
    className: "-rotate-2 sm:top-[8%] sm:left-[51%] sm:z-10 sm:w-[26%] sm:rotate-5",
    src: "/images/showcase/family-reading.png",
  },
  {
    alt: "A family watching the sunset by a lake",
    className: "rotate-3 sm:top-[14%] sm:right-[5%] sm:w-[26%] sm:rotate-7",
    src: "/images/showcase/sunset.png",
  },
];

export function GeneratorForm() {
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const executeGeneration = async (textToGenerate: string) => {
    if (!textToGenerate.trim() || isPending) {
      return;
    }
    setIsPending(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: textToGenerate }),
      });
      const json = (await response.json()) as GenerateResponse;
      setError(json.error);
      setImageBase64(json.imageBase64);
      setMediaType(json.mediaType);
    } catch {
      setError("Fehler bei der Bildgenerierung");
    } finally {
      setIsPending(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void executeGeneration(prompt);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void executeGeneration(prompt);
    }
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
      setError("Download fehlgeschlagen");
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "generated-image.png";
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const imageSrc =
    imageBase64 && mediaType ? `data:${mediaType};base64,${imageBase64}` : null;

  return (
    <div className="flex flex-1 flex-col justify-between">
      {/* Zentraler Canvas-Bereich */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 text-center sm:py-16">
        {!imageSrc && !isPending && (
          <div className="flex w-full max-w-6xl flex-col items-center">
            <div className="flex flex-col items-center">
              <SectionHeading as="h1" size={1} bold>
                Image Generator
              </SectionHeading>
              <p className="text-muted-foreground mt-3 text-base font-normal sm:text-xl">
                Beschreibe eine <strong className="text-primary font-bold">Szene</strong> im
                Social-Income-Aquarellstil.
              </p>
            </div>

            <div className="mt-10 grid w-full grid-cols-2 items-center gap-3 px-5 sm:relative sm:mt-14 sm:block sm:h-[clamp(18rem,32vw,27rem)] sm:px-0">
              {showcaseImages.map((image) => (
                <div
                  key={image.src}
                  className={`border-white/80 bg-card shadow-raised relative aspect-square overflow-hidden rounded-3xl border-4 p-1.5 sm:absolute ${image.className}`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 640px) 26vw, 43vw"
                    className="rounded-2xl object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {isPending && (
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="text-primary flex items-center justify-center">
              <AnimatedSILogoIcon width={84} height={48} />
            </div>
            <p className="text-muted-foreground text-sm font-medium sm:text-base">
              Generiere dein Bild im Aquarellstil, dies kann bis zu einer Minute dauern ...
            </p>
          </div>
        )}

        {imageSrc && !isPending && (
          <div className="flex flex-col items-center gap-6">
            <Image
              src={imageSrc}
              width={1920}
              height={1080}
              alt="Generated"
              className="border-input shadow-card max-h-[55vh] w-auto max-w-full rounded-3xl border object-contain"
            />
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button type="button" size="md" onClick={handleDownload}>
                Download PNG
              </Button>
              <Button asChild variant="outline" size="md">
                <Link href="/images">In Galerie ansehen →</Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Unten mittig fixierte AI-Eingabeleiste */}
      <div className="sticky bottom-6 z-30 mx-auto w-full max-w-5xl px-4 pt-4">
        <form
          onSubmit={handleSubmit}
          className="border-input bg-card/95 shadow-raised flex w-full items-end gap-2 rounded-3xl border p-2 pl-4 backdrop-blur-md"
        >
          <div className="flex-1 py-1">
            <Textarea
              variant="bare"
              name="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Beschreibe dein Bild ..."
              rows={2}
            />
          </div>

          <Button
            type="submit"
            size="md"
            disabled={isPending || prompt.trim() === ""}
          >
            <span>Generate</span>
            <span aria-hidden="true">→</span>
          </Button>
        </form>

        {error && (
          <p className="text-destructive mt-2 text-center text-xs font-medium">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
