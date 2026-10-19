'use client';

import { isGenerateResponse } from '@/lib/images';
import { Button } from '@socialincome/design-system/actions/button/button';
import { AnimatedSILogoIcon } from '@socialincome/design-system/brand/logo/logo';
import { Textarea } from '@socialincome/design-system/forms/textarea/textarea';
import Image from 'next/image';
import Link from 'next/link';
import { type KeyboardEvent, type ReactNode, useActionState, useState } from 'react';

type GenerationState = { imageSrc: string | null; error: string | null };

const generate = async (previous: GenerationState, formData: FormData): Promise<GenerationState> => {
	const prompt = formData.get('prompt');
	if (typeof prompt !== 'string' || !prompt.trim()) return previous;

	try {
		const response = await fetch('/api/generate-image', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ prompt }),
		});
		const json: unknown = await response.json();
		if (!isGenerateResponse(json) || (!response.ok && !json.error)) {
			return { ...previous, error: 'Fehler bei der Bildgenerierung' };
		}
		return {
			imageSrc: json.imageBase64 && json.mediaType ? `data:${json.mediaType};base64,${json.imageBase64}` : null,
			error: json.error,
		};
	} catch {
		return { ...previous, error: 'Fehler bei der Bildgenerierung' };
	}
};

export const GeneratorForm = ({ children }: { children: ReactNode }) => {
	const [prompt, setPrompt] = useState('');
	const [{ imageSrc, error }, formAction, isPending] = useActionState(generate, { imageSrc: null, error: null });

	const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
			event.preventDefault();
			if (!isPending && prompt.trim()) event.currentTarget.form?.requestSubmit();
		}
	};

	return (
		<div className="flex flex-1 flex-col justify-between">
			<div className="flex flex-1 flex-col items-center justify-center px-4 py-8 text-center sm:py-16">
				{!imageSrc && !isPending && children}

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
							<Button asChild size="md">
								<a href={imageSrc} download="generated-image.png">
									Download PNG
								</a>
							</Button>
							<Button asChild variant="outline" size="md">
								<Link href="/images">In Galerie ansehen →</Link>
							</Button>
						</div>
					</div>
				)}
			</div>

			<div className="sticky bottom-6 z-30 mx-auto w-full max-w-5xl -translate-y-4 px-4 pt-4">
				<form
					action={formAction}
					className="border-input bg-card/95 shadow-raised flex w-full items-end gap-2 rounded-3xl border px-2 py-3 pl-4 backdrop-blur-md"
				>
					<div className="flex-1 py-1">
						<Textarea
							variant="bare"
							name="prompt"
							aria-label="Beschreibe dein Bild"
							required
							value={prompt}
							onChange={(e) => setPrompt(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="Beschreibe dein Bild ..."
							rows={3}
						/>
					</div>

					<Button type="submit" size="md" disabled={isPending || prompt.trim() === ''}>
						<span>Generate</span>
						<span aria-hidden="true">→</span>
					</Button>
				</form>

				{error && !isPending && (
					<p className="text-destructive mt-2 text-center text-xs font-medium" role="alert">
						{error}
					</p>
				)}
			</div>
		</div>
	);
};
