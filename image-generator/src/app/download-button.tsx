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
	variant: 'default' | 'outline';
	size: 'sm' | 'md';
};

// One button that opens the two download formats, like the add menu in the prompt bar.
export const DownloadButton = ({ imageId, variant, size }: DownloadButtonProps) => {
	const href = `/api/gallery-images/${imageId}?download=1`;

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button type="button" variant={variant} size={size}>
					<Download aria-hidden="true" /> Download <ChevronDown aria-hidden="true" />
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
	);
};
