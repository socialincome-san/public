import { cva } from 'class-variance-authority';
import { ArrowRight, ExternalLink } from 'lucide-react';
import NextImage from 'next/image';
import NextLink from 'next/link';
import { cn } from '../../../cn';
import { Card } from '../card/card';

const imageVariants = cva('', {
	variants: {
		fit: {
			cover: 'object-cover',
			// Keeps illustrations whole, with room around them
			contain: 'object-contain p-6',
		},
		zoomOnHover: {
			true: 'transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none',
		},
	},
});

const bodyVariants = cva('flex flex-1 gap-4 p-6', {
	variants: {
		// A title alone lines up with the arrow; longer text starts at the top with the arrow at the bottom
		hasDescription: {
			true: 'items-end',
			false: 'items-center',
		},
	},
});

type LinkCardProps = {
	title: string;
	href: string;
	description?: string;
	// Small label above the title, e.g. who the link is for
	eyebrow?: string;
	// Decorative: the title already says where the link goes
	imageSrc?: string;
	imageFit?: 'cover' | 'contain';
	// Opens the link in a new tab
	external?: boolean;
};

export const LinkCard = ({
	title,
	href,
	description,
	eyebrow,
	imageSrc,
	imageFit = 'cover',
	external = false,
}: LinkCardProps) => {
	const Icon = external ? ExternalLink : ArrowRight;

	return (
		<NextLink
			href={href}
			target={external ? '_blank' : undefined}
			rel={external ? 'noopener noreferrer' : undefined}
			className="group focus-visible:ring-ring block h-full rounded-3xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
		>
			<Card elevation="flat" padding="none" interactive fullHeight>
				<div className="flex h-full flex-col">
					{imageSrc ? (
						<div className="bg-muted relative aspect-3/2 w-full overflow-hidden">
							<NextImage
								src={imageSrc}
								alt=""
								fill
								sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
								className={imageVariants({ fit: imageFit, zoomOnHover: true })}
							/>
						</div>
					) : null}
					<div className={bodyVariants({ hasDescription: Boolean(description) })}>
						<div className={cn('flex min-w-0 flex-1 flex-col gap-2', description && 'self-start')}>
							{eyebrow ? <p className="text-muted-foreground text-xs font-bold tracking-wide uppercase">{eyebrow}</p> : null}
							<p className="text-foreground group-hover:text-primary text-xl leading-snug font-bold transition-colors">
								{title}
							</p>
							{description ? <p className="text-muted-foreground">{description}</p> : null}
						</div>
						<span
							className="border-border text-primary group-hover:bg-primary group-hover:text-primary-foreground flex size-11 shrink-0 items-center justify-center rounded-full border transition-colors"
							aria-hidden
						>
							<Icon className="size-5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
						</span>
					</div>
				</div>
			</Card>
		</NextLink>
	);
};
