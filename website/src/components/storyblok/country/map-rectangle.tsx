'use client';

import { MapImage, buildMapUrls } from '@/components/storyblok/country/map-image';
import { cn } from '@/lib/utils/cn';

type MapRectangleProps = {
	isoCode: string;
	countryName: string;
	className?: string;
};

export const MapRectangle = ({ isoCode, countryName, className }: MapRectangleProps) => {
	const { main: mainMapUrl, inset: insetMapUrl } = buildMapUrls(isoCode);

	return (
		<div className={cn('relative h-full w-full overflow-hidden rounded-md', className)}>
			<MapImage
				src={mainMapUrl}
				alt={`Map of ${countryName}`}
				sizes="(max-width: 1024px) calc(100vw - 3rem), 274px"
				wrapperClassName="absolute inset-0"
				containerClassName="relative h-full w-full overflow-hidden"
				placeholderClassName="rounded-md"
				imageClassName="object-cover"
			/>
			<div className="absolute right-[4%] bottom-[4%] aspect-square w-[28%]">
				<MapImage
					src={insetMapUrl}
					alt={`Map showing where ${countryName} is located on the continent`}
					sizes="(max-width: 1024px) 30vw, 80px"
					wrapperClassName="relative h-full w-full"
					containerClassName="relative h-full w-full overflow-hidden rounded-full border-4 border-white bg-white shadow-[0_0_22px_rgba(0,0,0,0.45)]"
					imageClassName="object-cover"
				/>
			</div>
		</div>
	);
};
