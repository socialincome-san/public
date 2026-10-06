'use client';

import { cn } from '@socialincome/design-system/cn';
import { Dialog, DialogContent, DialogTitle } from '@socialincome/design-system/overlays/dialog/dialog';
import { PlayIcon } from 'lucide-react';
import NextImage from 'next/image';
import { useState } from 'react';

type Props = {
	label: string;
	embedUrl: string;
	thumbnailSrc?: string;
	thumbnailAlt?: string;
	dialogTitle?: string;
	layout?: 'stacked' | 'row' | 'inline';
};

export const ExplainerVideoTrigger = ({
	label,
	embedUrl,
	thumbnailSrc,
	thumbnailAlt,
	dialogTitle,
	layout = 'stacked',
}: Props) => {
	const [isOpen, setIsOpen] = useState(false);
	const accessibleLabel = thumbnailAlt ?? dialogTitle ?? label;

	const thumbnail = thumbnailSrc ? (
		<span
			className={cn(
				'relative shrink-0 overflow-hidden shadow-md',
				layout === 'stacked' ? 'aspect-video h-12 rounded-full md:h-16' : 'aspect-video h-10 w-16 rounded-full',
			)}
		>
			<NextImage src={thumbnailSrc} alt={accessibleLabel} fill sizes="176px" className="object-cover" />
			<span className="bg-foreground/10 absolute inset-0" />
			<span
				className={cn(
					'bg-foreground/35 absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-transform duration-200 ease-out group-hover:scale-105',
					layout === 'stacked' ? 'h-8 w-8 md:h-12 md:w-12' : 'h-8 w-8',
				)}
			>
				<PlayIcon className={cn('text-primary-foreground', layout === 'stacked' ? 'size-6' : 'size-4')} />
			</span>
		</span>
	) : (
		<PlayIcon className="size-6 shrink-0" />
	);

	return (
		<>
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				className={cn(
					'group flex items-center text-left transition-colors',
					layout === 'stacked' && 'gap-2 self-start text-sm font-medium md:flex-col md:gap-4 md:self-center',
					layout === 'row' && 'border-border hover:bg-muted/50 w-full gap-2 border-b px-2 py-4 text-sm font-medium',
					layout === 'inline' && 'gap-3 text-base',
				)}
			>
				{thumbnail}
				<span className={layout === 'stacked' ? 'group-hover:underline' : undefined}>{label}</span>
			</button>

			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent size="lg" padding="none">
					<DialogTitle visuallyHidden>{dialogTitle ?? label}</DialogTitle>
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
