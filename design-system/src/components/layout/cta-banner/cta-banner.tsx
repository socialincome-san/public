import NextImage from 'next/image';
import { type ReactNode } from 'react';

type CtaBannerProps = {
	title: ReactNode;
	description?: ReactNode;
	action: ReactNode;
	// Decorative background, hidden from screen readers; the gradient keeps the text readable on the left
	imageSrc?: string;
};

export const CtaBanner = ({ title, description, action, imageSrc }: CtaBannerProps) => (
	<section className="bg-accent-foreground relative overflow-hidden rounded-3xl px-6 py-12 scheme-dark md:px-10 md:pt-16 md:pb-14">
		{imageSrc ? (
			<div aria-hidden className="pointer-events-none absolute inset-0">
				<NextImage
					src={imageSrc}
					alt=""
					fill
					sizes="(max-width: 768px) 100vw, 1200px"
					className="object-cover object-[70%_center] md:object-[right_center]"
				/>
				<div className="from-accent-foreground/95 via-accent-foreground/80 to-accent-foreground/20 md:from-accent-foreground/95 md:via-accent-foreground/60 absolute inset-0 bg-linear-to-br md:to-transparent" />
				<div className="absolute inset-0 bg-black/20" />
			</div>
		) : null}
		<div className="relative z-10 flex flex-col gap-5">
			<h2 className="text-4xl leading-none font-medium text-pretty text-white">{title}</h2>
			{description ? <p className="max-w-[488px] text-base leading-6 text-white">{description}</p> : null}
			<div>{action}</div>
		</div>
	</section>
);
