'use client';

import { MapImage, buildMapUrls } from '@/components/storyblok/country/map-image';

type MapBubbleProps = {
	isoCode: string;
	countryName: string;
};

export const MapBubble = ({ isoCode, countryName }: MapBubbleProps) => {
	const { main: mainMapUrl, inset: insetMapUrl } = buildMapUrls(isoCode);

	return (
		<div className="relative aspect-square w-full max-w-72 lg:max-w-104">
			<div className="absolute inset-0 flex items-start justify-start">
				<MapImage
					src={mainMapUrl}
					alt={`Map of ${countryName}`}
					sizes="(max-width: 1024px) calc(100vw - 3rem), 416px"
					wrapperClassName="relative aspect-square w-[88%] max-w-full"
					containerClassName="relative h-full w-full overflow-hidden rounded-full border-4 border-white shadow-[0_0_28px_rgba(0,0,0,0.45)]"
					imageClassName="object-cover"
				/>
			</div>
			<div className="absolute right-[4%] bottom-[4%] aspect-square w-[28%] translate-x-[1%] translate-y-[1%]">
				<MapImage
					src={insetMapUrl}
					alt={`Map showing where ${countryName} is located on the continent`}
					sizes="(max-width: 1024px) 30vw, 120px"
					wrapperClassName="relative h-full w-full"
					containerClassName="relative h-full w-full overflow-hidden rounded-full border-4 border-white bg-white shadow-[0_0_22px_rgba(0,0,0,0.45)]"
					imageClassName="object-cover"
				/>
			</div>
		</div>
	);
};
