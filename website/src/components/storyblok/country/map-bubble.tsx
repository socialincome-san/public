import Image from 'next/image';

type MapBubbleProps = {
	isoCode: string;
};

export function MapBubble({ isoCode }: MapBubbleProps) {
	const mainMapUrl = `/api/mapbox-static?isoCode=${encodeURIComponent(isoCode)}&variant=main`;
	const insetMapUrl = `/api/mapbox-static?isoCode=${encodeURIComponent(isoCode)}&variant=inset`;

	return (
		<div className="relative aspect-square w-full">
			<div className="absolute inset-0 overflow-hidden rounded-full border-4 border-white shadow-[0_0_28px_rgba(0,0,0,0.45)]">
				<Image
					src={mainMapUrl}
					alt={`Map of ${isoCode}`}
					fill
					sizes="(max-width: 1024px) 100vw, 448px"
					className="object-cover"
					unoptimized
				/>
			</div>

			<div className="absolute right-[-6%] bottom-[-6%] aspect-square w-[30%] overflow-hidden rounded-full border-4 border-white bg-white shadow-[0_0_22px_rgba(0,0,0,0.45)]">
				<Image
					src={insetMapUrl}
					alt={`Map showing where ${isoCode} is located on the continent`}
					fill
					sizes="(max-width: 1024px) 30vw, 134px"
					className="object-cover"
					unoptimized
				/>
			</div>
		</div>
	);
}
