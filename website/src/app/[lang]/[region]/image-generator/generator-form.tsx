'use client';

import { Button } from '@/components/button/button';
import Image from 'next/image';
import { useActionState } from 'react';
import { generateImage } from './generate-actions';

export function GeneratorForm() {
	const [state, formAction, isPending] = useActionState(generateImage, { error: null, imageUrl: null });

	return (
		<form action={formAction}>
			{state.error && <p className="text-destructive text-sm">{state.error}</p>}
			<textarea
				name="prompt"
				className="placeholder:text-muted-foreground border-border text-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full max-w-xl min-w-0 rounded-2xl border bg-transparent px-3 py-2 text-sm shadow-xs outline-hidden focus-visible:ring-[3px]"
			></textarea>
			<Button type="submit" disabled={isPending} className="mx-auto rounded-full px-6">
				{isPending ? 'Generating...' : 'Generate'}
			</Button>
			{isPending && <p className="text-muted-foreground text-sm">Generating your image, this can take up to a minute...</p>}
			{state.imageUrl && (
				<Image
					src={state.imageUrl}
					width={1920}
					height={1080}
					alt="Generated"
					className="h-auto w-full max-w-xl rounded-lg shadow-lg"
				/>
			)}
		</form>
	);
}
