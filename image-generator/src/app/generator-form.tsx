"use client";

import { Button } from "@socialincome/design-system/actions/button/button";
import Image from "next/image";
import { useActionState } from "react";
import { generateImage } from "./generate-actions";
import { Textarea } from "@socialincome/design-system/forms/textarea/textarea";

export function GeneratorForm() {
  const [state, formAction, isPending] = useActionState(generateImage, {
    error: null,
    imageUrl: null,
  });

  return (
    <form action={formAction}>
      {state.error && <p className="text-destructive text-sm">{state.error}</p>}
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
      {state.imageUrl && (
        <>
          <Image
            src={state.imageUrl}
            width={1920}
            height={1080}
            alt="Generated"
            className="h-auto w-full max-w-xl rounded-lg shadow-lg"
          />
          <a href={`/download?url=${encodeURIComponent(state.imageUrl)}`}>
            Download PNG
          </a>
        </>
      )}
    </form>
  );
}
