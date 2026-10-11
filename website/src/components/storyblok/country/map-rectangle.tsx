'use client';

import { MapImage, buildMapUrls } from '@/components/storyblok/country/map-image';

type MapRectangleProps = {
	isoCode: string;
	countryName: string;
};

export const MapRectangle = ({ isoCode, countryName }: MapRectangleProps) => {
	const { main: mainMapUrl, inset: insetMapUrl } = buildMapUrls(isoCode);

	return (
		<div className="relative h-full w-full overflow-hidden rounded-md">
			<div className="absolute inset-0">
				<MapImage
					src={mainMapUrl}
					alt={`Map of ${countryName}`}
					sizes="(max-width: 1024px) calc(100vw - 3rem), 274px"
					shape="rectangle"
				/>
			</div>
			<div className="absolute right-[4%] bottom-[4%] aspect-square w-[28%]">
				<MapImage
					src={insetMapUrl}
					alt={`Map showing where ${countryName} is located on the continent`}
					sizes="(max-width: 1024px) 30vw, 80px"
					shape="circle"
				/>
			</div>
		</div>
	);
};
