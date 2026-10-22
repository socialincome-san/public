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
	'-rotate-3 md:top-[13%] md:left-[5%] md:w-[26%] md:-rotate-6',
	'rotate-2 md:top-0 md:left-[28%] md:z-20 md:w-[26%] md:-rotate-2',
	'-rotate-2 md:top-[8%] md:left-[51%] md:z-10 md:w-[26%] md:rotate-5',
	'rotate-3 md:top-[14%] md:right-[5%] md:w-[26%] md:rotate-7',
];

export const ImageShowcase = ({ images }: ImageShowcaseProps) => (
	<div className="grid w-full grid-cols-2 items-center gap-3 px-5 md:relative md:block md:h-[clamp(18rem,32vw,27rem)] md:px-0">
		{images.map((image, index) => (
			<div
				key={image.src}
				className={`bg-card shadow-raised relative aspect-square overflow-hidden rounded-3xl border-4 border-white/80 p-1.5 md:absolute ${positions[index % positions.length]}`}
			>
				<Image
					src={image.src}
					alt={image.alt}
					fill
					sizes="(min-width: 768px) 26vw, 43vw"
					loading="eager"
					className="rounded-2xl object-cover"
				/>
			</div>
		))}
	</div>
);
