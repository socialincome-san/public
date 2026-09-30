'use client';

import { Button } from '@/components/button/button';
import { useActionState } from 'react';
import { generateImage } from './generate-actions';

export function GeneratorForm() {
	const [error, formAction] = useActionState(generateImage, null);

	return (
		<form action={formAction}>
			{error && <p className="text-destructive text-sm">{error}</p>}
			<textarea
				name="prompt"
				className="placeholder:text-muted-foreground border-border text-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full max-w-xl min-w-0 rounded-2xl border bg-transparent px-3 py-2 text-sm shadow-xs outline-hidden focus-visible:ring-[3px]"
			></textarea>
			<Button type="submit" className="mx-auto rounded-full px-6">
				Generate
			</Button>
		</form>
	);
}
