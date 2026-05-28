'use client';

import Image from 'next/image';
import { useState } from 'react';

type MapBubbleProps = {
	isoCode: string;
	countryName: string;
};

type MapImageBubbleProps = {
	src: string;
	alt: string;
	sizes: string;
	wrapperClassName: string;
	bubbleClassName?: string;
	imageClassName?: string;
};

const MapImageBubble = ({ src, alt, sizes, wrapperClassName, bubbleClassName, imageClassName }: MapImageBubbleProps) => {
	const [hasImageError, setHasImageError] = useState(false);

	return (
		<div className={wrapperClassName}>
			<div className={bubbleClassName}>
				<div className="bg-muted/20 absolute inset-0 flex items-center justify-center">
					<div className="bg-primary/10 flex h-[46%] w-[46%] items-center justify-center rounded-full">
						<div className="bg-primary/15 h-[56%] w-[56%] rounded-full" />
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

export const MapBubble = ({ isoCode, countryName }: MapBubbleProps) => {
	const mainMapUrl = `/api/mapbox-static?isoCode=${encodeURIComponent(isoCode)}&variant=main`;
	const insetMapUrl = `/api/mapbox-static?isoCode=${encodeURIComponent(isoCode)}&variant=inset`;

	return (
		<div className="relative aspect-square w-full max-w-104">
			<div className="absolute inset-0 flex items-start justify-start">
				<MapImageBubble
					src={mainMapUrl}
					alt={`Map of ${countryName}`}
					sizes="(max-width: 1024px) calc(100vw - 3rem), 416px"
					wrapperClassName="relative aspect-square w-[88%] max-w-full"
					bubbleClassName="relative h-full w-full overflow-hidden rounded-full border-4 border-white shadow-[0_0_28px_rgba(0,0,0,0.45)]"
					imageClassName="object-cover"
				/>
			</div>
			<div className="absolute right-[4%] bottom-[4%] aspect-square w-[28%] translate-x-[1%] translate-y-[1%]">
				<MapImageBubble
					src={insetMapUrl}
					alt={`Map showing where ${countryName} is located on the continent`}
					sizes="(max-width: 1024px) 30vw, 120px"
					wrapperClassName="relative h-full w-full"
					bubbleClassName="relative h-full w-full overflow-hidden rounded-full border-4 border-white bg-white shadow-[0_0_22px_rgba(0,0,0,0.45)]"
					imageClassName="object-cover"
				/>
			</div>
		</div>
	);
};
