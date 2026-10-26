'use client';

import { type GalleryImage } from '@/lib/images';
import { Button } from '@socialincome/design-system/actions/button/button';
import { Badge } from '@socialincome/design-system/data-display/badge/badge';
import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@socialincome/design-system/overlays/tool-tip/tool-tip';
import { Download, Info } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ImageCommentModal } from '../image-comment-modal';
import { STYLE_TEMPLATE } from '../style-template';

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
	dateStyle: 'medium',
	timeStyle: 'short',
	timeZone: 'Europe/Zurich',
});

const getUserPrompt = (prompt: string | null) => {
	if (!prompt) return 'No prompt saved.';
	if (prompt.startsWith('Edit the supplied original image according to all of the following comments.')) {
		const marker = ' Comments: ';
		const start = prompt.indexOf(marker);
		if (start === -1) return 'No user prompt.';
		try {
			const comments: unknown = JSON.parse(prompt.slice(start + marker.length));
			if (!Array.isArray(comments)) return 'No user prompt.';
			return (
				comments
					.flatMap((comment: unknown) =>
						typeof comment === 'object' && comment !== null && 'text' in comment && typeof comment.text === 'string'
							? [comment.text.trim()]
							: [],
					)
					.filter(Boolean)
					.join('\n') || 'No user prompt.'
			);
		} catch {
			return 'No user prompt.';
		}
	}
	if (prompt.startsWith('Hand-painted watercolor editorial illustration') && !prompt.startsWith(STYLE_TEMPLATE)) {
		const marker = ' Subject:';
		const start = prompt.indexOf(marker);
		return start === -1 ? 'No user prompt.' : prompt.slice(start + marker.length).trim() || 'No user prompt.';
	}
	return (prompt.startsWith(STYLE_TEMPLATE) ? prompt.slice(STYLE_TEMPLATE.length).trim() : prompt) || 'No user prompt.';
};

const GalleryPreview = ({ image, prompt }: { image: GalleryImage; prompt: string }) => {
	const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

	return (
		<div className="bg-muted/40 relative aspect-video w-full overflow-hidden" aria-busy={status === 'loading'}>
			<Image
				src={`/api/gallery-images/${image.id}`}
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
					<AppLoadingSkeleton message="Loading image …" />
				</div>
			)}
			{status === 'error' && (
				<div
					className="bg-card text-muted-foreground absolute inset-0 flex items-center justify-center p-4 text-sm"
					role="status"
				>
					Image could not be loaded.
				</div>
			)}
		</div>
	);
};

export const ImageGallery = ({ images }: { images: GalleryImage[] }) => {
	if (images.length === 0) {
		return (
			<div className="border-border bg-card flex flex-col items-center justify-center rounded-3xl border p-12 text-center sm:p-16">
				<Badge variant="outline">Gallery empty</Badge>
				<h2 className="text-primary mt-4 text-xl font-semibold sm:text-2xl">No images generated yet</h2>
				<p className="text-muted-foreground mt-2 max-w-md text-sm sm:text-base">
					Create your first AI-generated image in the Social Income style.
				</p>
				<div className="mt-6">
					<Button asChild>
						<Link href="/">Go to Image Generator →</Link>
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{images.map((image) => {
				const prompt = getUserPrompt(image.prompt);
				return (
					<article key={image.id} className="border-border bg-card flex flex-col overflow-hidden rounded-2xl border">
						<GalleryPreview image={image} prompt={prompt} />
						<div className="mt-auto flex flex-wrap items-center justify-between gap-3 p-4">
							<div className="text-muted-foreground text-xs">
								{image.created_at ? (
									<time dateTime={image.created_at}>{dateFormatter.format(new Date(image.created_at))}</time>
								) : (
									'Date not saved'
								)}
							</div>
							<div className="flex items-center gap-1">
								<Tooltip>
									<TooltipTrigger asChild>
										<Button type="button" variant="ghost" size="icon-sm" aria-label="Show image prompt">
											<Info aria-hidden="true" />
										</Button>
									</TooltipTrigger>
									<TooltipContent size="lg" sideOffset={8}>
										<div className="max-h-64 overflow-y-auto break-words whitespace-pre-wrap">
											<p className="mb-2 font-bold">Image prompt</p>
											{prompt}
										</div>
									</TooltipContent>
								</Tooltip>
								<ImageCommentModal src={`/api/gallery-images/${image.id}?original=1`} />
								<Button asChild variant="outline" size="sm">
									<a href={`/api/gallery-images/${image.id}?download=1`} download>
										<Download aria-hidden="true" /> Download
									</a>
								</Button>
							</div>
						</div>
					</article>
				);
			})}
		</div>
	);
};
