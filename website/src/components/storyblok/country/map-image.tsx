'use client';

import { cn } from '@/lib/utils/cn';
import Image from 'next/image';
import { useState } from 'react';

type MapImageProps = {
	src: string;
	alt: string;
	sizes: string;
	wrapperClassName: string;
	containerClassName?: string;
	placeholderClassName?: string;
	imageClassName?: string;
};

export const MapImage = ({
	src,
	alt,
	sizes,
	wrapperClassName,
	containerClassName = 'relative h-full w-full overflow-hidden',
	placeholderClassName = 'rounded-full',
	imageClassName = 'object-cover',
}: MapImageProps) => {
	const [hasImageError, setHasImageError] = useState(false);

	return (
		<div className={wrapperClassName}>
			<div className={containerClassName}>
				<div className="bg-muted/20 absolute inset-0 flex items-center justify-center">
					<div
						className={cn(
							'bg-primary/10 flex h-[46%] w-[46%] items-center justify-center',
							placeholderClassName,
						)}
					>
						<div className={cn('bg-primary/15 h-[56%] w-[56%]', placeholderClassName)} />
					</div>
				</div>
				{!hasImageError && (
					<Image
						src={src}
						alt={alt}
						fill
						sizes={sizes}
						className={imageClassName}
						onError={() => setHasImageError(true)}
						unoptimized
					/>
				)}
			</div>
		</div>
	);
};

const buildMapUrl = (isoCode: string, variant: 'main' | 'inset') =>
	`/api/mapbox-static?isoCode=${encodeURIComponent(isoCode.toLowerCase())}&variant=${variant}`;

export const buildMapUrls = (isoCode: string) => ({
	main: buildMapUrl(isoCode, 'main'),
	inset: buildMapUrl(isoCode, 'inset'),
});
