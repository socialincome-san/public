import Image from 'next/image';

export const GlobeFallback = () => (
	<div className="relative size-full">
		<Image
			src="/assets/globe/globe-fallback.svg"
			alt=""
			fill
			sizes="(min-width: 768px) 50vw, 100vw"
			className="object-contain"
		/>
	</div>
);
