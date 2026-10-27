'use client';

import { type GalleryImage, imageUrl } from '@/lib/images';
import { Button } from '@socialincome/design-system/actions/button/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@socialincome/design-system/overlays/dropdown-menu/dropdown-menu';
import { ChevronDown, Download } from 'lucide-react';

type DownloadMenuProps = {
	imageId: GalleryImage['id'];
	variant: 'default' | 'outline';
	size: 'sm' | 'md';
};

export const DownloadMenu = ({ imageId, variant, size }: DownloadMenuProps) => (
	<DropdownMenu modal={false}>
		<DropdownMenuTrigger asChild>
			<Button type="button" variant={variant} size={size}>
				<Download aria-hidden="true" /> Download <ChevronDown aria-hidden="true" />
			</Button>
		</DropdownMenuTrigger>
		<DropdownMenuContent align="end">
			<DropdownMenuItem asChild>
				<a href={imageUrl(imageId, 'original', { download: true })} download>
					White background
				</a>
			</DropdownMenuItem>
			<DropdownMenuItem asChild>
				<a href={imageUrl(imageId, 'transparent', { download: true })} download>
					Transparent background
				</a>
			</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
);
