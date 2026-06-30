'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/dialog';
import { cn } from '@/lib/utils/cn';
import { PlayIcon } from 'lucide-react';
import NextImage from 'next/image';
import { useState } from 'react';

type Props = {
	label: string;
	embedUrl: string;
	thumbnailSrc?: string;
	thumbnailAlt?: string;
	dialogTitle?: string;
	layout?: 'stacked' | 'row';
	className?: string;
};

export const ExplainerVideoTrigger = ({
	label,
	embedUrl,
	thumbnailSrc,
	thumbnailAlt,
	dialogTitle,
	layout = 'stacked',
	className,
}: Props) => {
	const [isOpen, setIsOpen] = useState(false);
	const accessibleLabel = thumbnailAlt ?? dialogTitle ?? label;

	const thumbnail = thumbnailSrc ? (
		<span
			className={cn(
				'relative shrink-0 overflow-hidden shadow-md',
				layout === 'row' ? 'aspect-video h-10 w-16 rounded-full' : 'aspect-video h-12 rounded-full md:h-16',
			)}
		>
			<NextImage src={thumbnailSrc} alt={accessibleLabel} fill sizes="176px" className="object-cover" />
			<span className="bg-foreground/10 absolute inset-0" />
			<span
				className={cn(
					'bg-foreground/35 absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-transform duration-200 ease-out group-hover:scale-105',
					layout === 'row' ? 'h-8 w-8' : 'h-8 w-8 md:h-12 md:w-12',
				)}
			>
				<PlayIcon className={cn('text-primary-foreground', layout === 'row' ? 'size-4' : 'size-6')} />
			</span>
		</span>
	) : (
		<PlayIcon className={cn('shrink-0', layout === 'row' ? 'size-6' : 'size-6')} />
	);

	return (
		<>
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				className={cn(
					'group text-left text-sm font-medium transition-colors',
					layout === 'row'
						? 'border-border hover:bg-muted/50 flex w-full items-center gap-2 border-b px-2 py-4'
						: 'flex items-center gap-2 self-center md:flex-col md:items-center md:gap-4',
					className,
				)}
			>
				{thumbnail}
				<span className={layout === 'stacked' ? 'group-hover:underline' : undefined}>{label}</span>
			</button>

			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent
					overlayClassName="z-[60]"
					className="sm:max-w-content z-[60] overflow-hidden rounded-3xl border-none p-0"
				>
					<DialogTitle className="sr-only">{dialogTitle ?? label}</DialogTitle>
					<iframe
						src={embedUrl}
						title={dialogTitle ?? label}
						sandbox="allow-scripts allow-same-origin allow-presentation"
						allow="fullscreen; autoplay"
						loading="lazy"
						className="aspect-video w-full border-0"
					/>
				</DialogContent>
			</Dialog>
		</>
	);
};
