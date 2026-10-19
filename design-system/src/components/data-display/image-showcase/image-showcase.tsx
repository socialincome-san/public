import Image from 'next/image';

type ImageShowcaseProps = {
	images: [
		{ src: string; alt: string },
		{ src: string; alt: string },
		{ src: string; alt: string },
		{ src: string; alt: string },
	];
};

const positions = [
	'-rotate-3 sm:top-[13%] sm:left-[5%] sm:w-[26%] sm:-rotate-6',
	'rotate-2 sm:top-0 sm:left-[28%] sm:z-20 sm:w-[26%] sm:-rotate-2',
	'-rotate-2 sm:top-[8%] sm:left-[51%] sm:z-10 sm:w-[26%] sm:rotate-5',
	'rotate-3 sm:top-[14%] sm:right-[5%] sm:w-[26%] sm:rotate-7',
];

export const ImageShowcase = ({ images }: ImageShowcaseProps) => (
	<div className="grid w-full grid-cols-2 items-center gap-3 px-5 sm:relative sm:block sm:h-[clamp(18rem,32vw,27rem)] sm:px-0">
		{images.map((image, index) => (
			<div
				key={image.src}
				className={`bg-card shadow-raised relative aspect-square overflow-hidden rounded-3xl border-4 border-white/80 p-1.5 sm:absolute ${positions[index % positions.length]}`}
			>
				<Image
					src={image.src}
					alt={image.alt}
					fill
					sizes="(min-width: 640px) 26vw, 43vw"
					loading="eager"
					className="rounded-2xl object-cover"
				/>
			</div>
		))}
	</div>
);
