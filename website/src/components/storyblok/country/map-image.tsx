'use client';

import { cn } from '@socialincome/design-system/cn';
import Image from 'next/image';
import { useState } from 'react';

type MapImageProps = {
	src: string;
	alt: string;
	sizes: string;
	/** Rectangle fills its container; circle is a framed round map (also used for the inset locator map) */
	shape: 'rectangle' | 'circle';
};

// Fills its parent, which sets the size and position
export const MapImage = ({ src, alt, sizes, shape }: MapImageProps) => {
	const [hasImageError, setHasImageError] = useState(false);
	const placeholderShape = shape === 'circle' ? 'rounded-full' : 'rounded-md';

	return (
		<div
			className={cn(
				'relative h-full w-full overflow-hidden',
				shape === 'circle' &&
					'border-primary-foreground bg-primary-foreground rounded-full border-4 shadow-[0_0_22px_rgba(0,0,0,0.1)]',
			)}
		>
			<div className="bg-muted/20 absolute inset-0 flex items-center justify-center">
				<div className={cn('bg-primary/10 flex h-[46%] w-[46%] items-center justify-center', placeholderShape)}>
					<div className={cn('bg-primary/15 h-[56%] w-[56%]', placeholderShape)} />
				</div>
			</div>
			{!hasImageError && (
				<Image
					src={src}
					alt={alt}
					fill
					sizes={sizes}
					className="object-cover"
					onError={() => setHasImageError(true)}
					unoptimized
				/>
			)}
		</div>
	);
};

const buildMapUrl = (isoCode: string, variant: 'main' | 'inset') =>
	`/api/mapbox-static?isoCode=${encodeURIComponent(isoCode.toLowerCase())}&variant=${variant}`;

export const buildMapUrls = (isoCode: string) => ({
	main: buildMapUrl(isoCode, 'main'),
	inset: buildMapUrl(isoCode, 'inset'),
});
