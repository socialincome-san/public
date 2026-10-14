import NextImage from 'next/image';
import { type ReactNode } from 'react';
import { QuoteIcon } from '../../icons/custom-icons/custom-icons';

type AuthPanelImage = {
	src: string;
	alt: string;
};

type AuthPanelProps = {
	image: AuthPanelImage;
	// Shown on the image on medium screens and up, e.g. an `AuthPanelQuote`
	caption?: ReactNode;
	// Below the form, e.g. a support contact
	footer?: ReactNode;
	children: ReactNode;
};

export const AuthPanel = ({ image, caption, footer, children }: AuthPanelProps) => (
	<div className="bg-card shadow-card grid overflow-hidden rounded-4xl p-2 md:grid-cols-2 md:p-3">
		<div className="flex flex-col gap-10 px-4 pt-8 pb-6 sm:px-10 md:pt-14 md:pb-8">
			<div className="flex flex-1 items-center">
				<div className="w-full max-w-sm">{children}</div>
			</div>
			{footer ? <div className="text-muted-foreground text-xs">{footer}</div> : null}
		</div>

		<div className="bg-foreground relative order-first min-h-48 overflow-hidden rounded-3xl sm:min-h-64 md:order-none md:min-h-144">
			<NextImage
				src={image.src}
				alt={image.alt}
				fill
				sizes="(min-width: 768px) 50vw, 100vw"
				className="motion-safe:animate-settle-zoom object-cover"
				priority
			/>
			{caption ? (
				<>
					<div className="from-foreground/85 via-foreground/25 absolute inset-0 hidden bg-linear-to-t to-transparent md:block" />
					<div className="text-primary-foreground drop-shadow-on-media absolute inset-x-0 bottom-0 hidden p-8 md:block lg:p-10">
						{caption}
					</div>
				</>
			) : null}
		</div>
	</div>
);

type AuthPanelQuoteProps = {
	quote: string;
	author: string;
};

export const AuthPanelQuote = ({ quote, author }: AuthPanelQuoteProps) => (
	<figure className="flex flex-col gap-5">
		<QuoteIcon />
		<blockquote className="text-xl leading-snug font-medium text-balance lg:text-2xl">{quote}</blockquote>
		<figcaption className="text-sm font-medium opacity-90">{author}</figcaption>
	</figure>
);
