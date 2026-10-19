'use client';

import { Button } from '@socialincome/design-system/actions/button/button';
import { Badge } from '@socialincome/design-system/data-display/badge/badge';
import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@socialincome/design-system/overlays/tool-tip/tool-tip';
import { Download, Info } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { STYLE_TEMPLATE } from '../style-template';

export type GalleryImage = {
	prompt: string | null;
	image_base64: string;
	media_type: string;
	created_at: string | null;
};

const dateFormatter = new Intl.DateTimeFormat('de-CH', {
	dateStyle: 'medium',
	timeStyle: 'short',
	timeZone: 'Europe/Zurich',
});

const getUserPrompt = (prompt: string | null) => {
	if (!prompt) return 'Kein Prompt hinterlegt.';
	return (prompt.startsWith(STYLE_TEMPLATE) ? prompt.slice(STYLE_TEMPLATE.length).trim() : prompt) || 'Kein Benutzer-Prompt.';
};

const handleDownload = async (image: GalleryImage) => {
	const response = await fetch(`data:${image.media_type};base64,${image.image_base64}`);
	const url = URL.createObjectURL(await response.blob());
	const link = document.createElement('a');
	link.href = url;
	const extension = image.media_type === 'image/jpeg' ? 'jpg' : image.media_type === 'image/webp' ? 'webp' : 'png';
	const filename = image.created_at ? `social-income-${image.created_at.replaceAll(':', '-')}` : 'social-income-image';
	link.download = `${filename}.${extension}`;
	document.body.append(link);
	link.click();
	link.remove();
	URL.revokeObjectURL(url);
};

const GalleryPreview = ({ image, prompt }: { image: GalleryImage; prompt: string }) => {
	const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

	return (
		<div className="bg-muted/40 relative aspect-video w-full overflow-hidden" aria-busy={status === 'loading'}>
			<Image
				src={`data:${image.media_type};base64,${image.image_base64}`}
				width={640}
				height={360}
				alt={prompt}
				className="h-full w-full object-contain"
				onLoad={() => setStatus('loaded')}
				onError={() => setStatus('error')}
				unoptimized
			/>
			{status === 'loading' && (
				<div className="absolute inset-3 overflow-hidden [&>div]:h-full [&>div]:min-h-0 [&>div]:rounded-none md:[&>div]:min-h-0">
					<AppLoadingSkeleton message="Bild wird geladen …" />
				</div>
			)}
			{status === 'error' && (
				<div className="bg-card text-muted-foreground absolute inset-0 flex items-center justify-center p-4 text-sm" role="status">
					Bild konnte nicht geladen werden.
				</div>
			)}
		</div>
	);
};

export const ImageGallery = ({ images }: { images: GalleryImage[] }) => {
	if (images.length === 0) {
		return (
			<div className="border-border bg-card flex flex-col items-center justify-center rounded-3xl border p-12 text-center sm:p-16">
				<Badge variant="outline">Galerie leer</Badge>
				<h2 className="text-primary mt-4 text-xl font-semibold sm:text-2xl">Noch keine Bilder generiert</h2>
				<p className="text-muted-foreground mt-2 max-w-md text-sm sm:text-base">
					Erstelle dein erstes KI-generiertes Bild im Social-Income-Stil.
				</p>
				<div className="mt-6">
					<Button asChild><Link href="/">Zum Image Generator →</Link></Button>
				</div>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{images.map((image, index) => {
				const prompt = getUserPrompt(image.prompt);
				return (
					<article key={index} className="border-border bg-card flex flex-col overflow-hidden rounded-2xl border">
						<GalleryPreview key={image.image_base64} image={image} prompt={prompt} />
						<div className="mt-auto flex flex-wrap items-center justify-between gap-3 p-4">
							<div className="text-muted-foreground text-xs">
								{image.created_at ? (
									<time dateTime={image.created_at}>{dateFormatter.format(new Date(image.created_at))}</time>
								) : 'Zeitpunkt nicht gespeichert'}
							</div>
							<div className="flex items-center gap-1">
								<Tooltip>
									<TooltipTrigger asChild>
										<Button type="button" variant="ghost" size="icon-sm" aria-label="Bild-Prompt anzeigen">
											<Info aria-hidden="true" />
										</Button>
									</TooltipTrigger>
									<TooltipContent size="lg" sideOffset={8}>
										<div className="max-h-64 overflow-y-auto whitespace-pre-wrap break-words">
											<p className="mb-2 font-bold">Bild-Prompt</p>
											{prompt}
										</div>
									</TooltipContent>
								</Tooltip>
								<Button type="button" variant="outline" size="sm" onClick={() => void handleDownload(image)}>
									<Download aria-hidden="true" /> Download
								</Button>
							</div>
						</div>
					</article>
				);
			})}
		</div>
	);
};
