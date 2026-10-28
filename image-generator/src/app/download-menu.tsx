'use client';

import { type GalleryImage, imageDownloadUrl, imageUrl } from '@/lib/images';
import { Button } from '@socialincome/design-system/actions/button/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@socialincome/design-system/overlays/dropdown-menu/dropdown-menu';
import { ChevronDown, Download } from 'lucide-react';

type DownloadMenuProps = {
	image: GalleryImage;
	variant: 'default' | 'outline';
	size: 'sm' | 'md';
};

export const DownloadMenu = ({ image, variant, size }: DownloadMenuProps) => (
	<DropdownMenu modal={false}>
		<DropdownMenuTrigger asChild>
			<Button type="button" variant={variant} size={size}>
				<Download aria-hidden="true" /> Download <ChevronDown aria-hidden="true" />
			</Button>
		</DropdownMenuTrigger>
		<DropdownMenuContent align="end">
			<DropdownMenuItem asChild>
				<a href={imageDownloadUrl(image.imageUrl)} download>
					White background
				</a>
			</DropdownMenuItem>
			<DropdownMenuItem asChild>
				<a href={imageUrl(image.id, { download: true })} download>
					Transparent background
				</a>
			</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
);
