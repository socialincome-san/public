'use client';

import { Info } from 'lucide-react';
import Image from 'next/image';
import { type ReactNode, useState } from 'react';
import { cn } from '../../../cn';
import { Button } from '../../actions/button/button';
import { AppLoadingSkeleton } from '../../feedback/app-loading-skeleton/app-loading-skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../overlays/tool-tip/tool-tip';
import { Badge } from '../badge/badge';

type GalleryImage = {
	id: string;
	src: string;
	alt: string;
	price?: string;
	date?: { label: string; value?: string };
	prompt?: { text: string; title: string; triggerLabel: string };
	actions?: ReactNode;
	overlay?: ReactNode;
};

type ImageGalleryProps = {
	images: GalleryImage[];
	loadingLabel: string;
	errorLabel: string;
	density?: 'comfortable' | 'compact';
	pagination?: { pageSize: number; loadMoreLabel: string };
	emptyState?: { badge: string; title: string; description: string; action: ReactNode };
};

const PromptInfo = ({ prompt }: { prompt: NonNullable<GalleryImage['prompt']> }) => (
	<Tooltip>
		<TooltipTrigger asChild>
			<Button type="button" variant="ghost" size="icon-sm" aria-label={prompt.triggerLabel}>
				<Info aria-hidden="true" />
			</Button>
		</TooltipTrigger>
		<TooltipContent size="lg" sideOffset={8}>
			<div className="max-h-64 overflow-y-auto break-words whitespace-pre-wrap">
				<p className="mb-2 font-bold">{prompt.title}</p>
				{prompt.text}
			</div>
		</TooltipContent>
	</Tooltip>
);

const GalleryPreview = ({
	image,
	loadingLabel,
	errorLabel,
	density,
}: {
	image: GalleryImage;
	loadingLabel: string;
	errorLabel: string;
	density: ImageGalleryProps['density'];
}) => {
	const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

	return (
		<div
			className={cn('bg-muted/40 relative w-full overflow-hidden', density === 'compact' ? 'aspect-square' : 'aspect-video')}
			aria-busy={status === 'loading'}
		>
			<Image
				src={image.src}
				width={640}
				height={360}
				alt={image.alt}
				loading="lazy"
				className="h-full w-full object-contain"
				onLoad={() => setStatus('loaded')}
				onError={() => setStatus('error')}
				unoptimized
			/>
			{status === 'loading' && (
				<div className="absolute inset-3 overflow-hidden [&>div]:h-full [&>div]:min-h-0 [&>div]:rounded-none md:[&>div]:min-h-0">
					<AppLoadingSkeleton message={loadingLabel} />
				</div>
			)}
			{status === 'error' && (
				<div
					className={cn(
						'bg-card text-muted-foreground absolute inset-0 flex items-center justify-center text-center',
						density === 'compact' ? 'p-2 text-xs sm:p-4 sm:text-sm' : 'p-4 text-sm',
					)}
					role="status"
				>
					{errorLabel}
				</div>
			)}
		</div>
	);
};

export const ImageGallery = ({
	images,
	loadingLabel,
	errorLabel,
	density = 'comfortable',
	pagination,
	emptyState,
}: ImageGalleryProps) => {
	const [pageCount, setPageCount] = useState(1);
	const visibleImages = pagination ? images.slice(0, pageCount * pagination.pageSize) : images;

	if (images.length === 0) {
		return emptyState ? (
			<div className="border-border bg-card flex flex-col items-center justify-center rounded-3xl border p-12 text-center sm:p-16">
				<Badge variant="outline">{emptyState.badge}</Badge>
				<h2 className="text-primary mt-4 text-xl font-semibold sm:text-2xl">{emptyState.title}</h2>
				<p className="text-muted-foreground mt-2 max-w-md text-sm sm:text-base">{emptyState.description}</p>
				<div className="mt-6">{emptyState.action}</div>
			</div>
		) : null;
	}

	return (
		<>
			<div
				className={cn(
					'grid',
					density === 'compact'
						? 'grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4'
						: 'grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3',
				)}
			>
				{visibleImages.map((image) => (
					<article key={image.id} className="border-border bg-card flex flex-col overflow-hidden rounded-2xl border">
						<div className="relative">
							<GalleryPreview image={image} loadingLabel={loadingLabel} errorLabel={errorLabel} density={density} />
							{image.overlay && <div className="bg-card absolute top-3 right-3 rounded-full">{image.overlay}</div>}
						</div>
						{(image.date !== undefined ||
							image.price !== undefined ||
							image.prompt !== undefined ||
							image.actions !== undefined) && (
							<div
								className={cn(
									'mt-auto',
									density === 'compact'
										? 'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-1 gap-y-1 p-2 sm:gap-x-2 sm:p-3'
										: 'flex flex-wrap items-center justify-between gap-3 p-4',
								)}
							>
								<div className="text-muted-foreground flex min-w-0 items-center gap-2 text-xs [&>div]:max-w-full">
									{image.date &&
										(image.date.value ? <time dateTime={image.date.value}>{image.date.label}</time> : image.date.label)}
									{density === 'comfortable' && image.date && image.price && <span aria-hidden="true">·</span>}
									{image.price &&
										(density === 'compact' ? (
											<Badge variant="outline">
												<span className="min-w-0 text-xs whitespace-nowrap sm:text-sm">{image.price}</span>
											</Badge>
										) : (
											<span className="whitespace-nowrap">{image.price}</span>
										))}
									{density === 'comfortable' && image.prompt && <PromptInfo prompt={image.prompt} />}
								</div>
								{((density === 'compact' && image.prompt !== undefined) || image.actions !== undefined) && (
									<div className="ml-auto flex flex-wrap items-center gap-2">
										{density === 'compact' && image.prompt && <PromptInfo prompt={image.prompt} />}
										{image.actions}
									</div>
								)}
							</div>
						)}
					</article>
				))}
			</div>
			{pagination && visibleImages.length < images.length && (
				<div className="mt-8 flex justify-center">
					<Button type="button" onClick={() => setPageCount((previous) => previous + 1)}>
						{pagination.loadMoreLabel}
					</Button>
				</div>
			)}
		</>
	);
};
