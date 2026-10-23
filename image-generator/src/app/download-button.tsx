'use client';

import { type GalleryImage } from '@/lib/images';
import { Button } from '@socialincome/design-system/actions/button/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@socialincome/design-system/overlays/dropdown-menu/dropdown-menu';
import { ChevronDown, Download } from 'lucide-react';

type DownloadButtonProps = {
	imageId: GalleryImage['id'];
	label: string;
	variant: 'default' | 'outline';
	size: 'sm' | 'md';
};

// Split button: the main part downloads the original, the menu adds the transparent cutout.
export const DownloadButton = ({ imageId, label, variant, size }: DownloadButtonProps) => {
	const href = `/api/gallery-images/${imageId}?download=1`;

	return (
		// The design-system Button has no className prop, so the wrapper squares the inner corners.
		<div
			className={`flex overflow-hidden rounded-full *:rounded-none *:after:rounded-none ${variant === 'default' ? 'divide-primary-foreground/30 divide-x' : 'border-input *:last:border-input border *:border-0 *:last:border-l'}`}
		>
			<Button asChild variant={variant} size={size}>
				<a href={href} download>
					<Download aria-hidden="true" /> {label}
				</a>
			</Button>
			<DropdownMenu modal={false}>
				<DropdownMenuTrigger asChild>
					<Button
						type="button"
						variant={variant}
						size={size === 'sm' ? 'icon-sm' : 'icon-lg'}
						aria-label="More download options"
					>
						<ChevronDown aria-hidden="true" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem asChild>
						<a href={href} download>
							PNG with white background
						</a>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<a href={`${href}&transparent=1`} download>
							PNG with transparent background
						</a>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};
