import { cva } from 'class-variance-authority';
import NextImage from 'next/image';
import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../../cn';
import { type WithoutClassName } from '../../../without-class-name';
import { Progress } from '../../feedback/progress/progress';
import { BlockWrapper } from '../block-wrapper/block-wrapper';

type MediaHeroImage = {
	src: string;
	alt: string;
};

const overlayClasses = {
	soft: 'from-foreground/70 via-foreground/35 to-foreground/15 bg-gradient-to-t',
	strong: 'bg-[linear-gradient(to_top,hsl(var(--foreground))_0%,hsl(var(--foreground)/0.85)_22%,transparent_55%)]',
	none: 'hidden',
};

const contentVariants = cva(
	'text-primary-foreground w-site-width max-w-content absolute inset-0 z-20 mx-auto mb-8 flex flex-row justify-between gap-8',
	{
		variants: {
			align: {
				bottom: 'items-end md:mb-24',
				center: 'items-end md:mb-0 md:items-center',
			},
		},
	},
);

type MediaHeroProps = WithoutClassName<HTMLAttributes<HTMLElement>> & {
	children: ReactNode;
	// An image, or with `media` a custom background such as a video
	image?: MediaHeroImage | null;
	media?: ReactNode;
	overlay?: keyof typeof overlayClasses;
	align?: 'bottom' | 'center';
	// Above the content, below the floating site header
	top?: ReactNode;
	// Shown next to the content on large screens
	aside?: ReactNode;
	// Shown below the hero on small screens
	mobileAside?: ReactNode;
	controlsStart?: ReactNode;
	controlsEnd?: ReactNode;
	// The media fills the frame without rounding or content, e.g. a video played full size
	expanded?: boolean;
};

export const MediaHero = ({
	children,
	image,
	media,
	overlay = 'soft',
	align = 'bottom',
	top,
	aside,
	mobileAside,
	controlsStart,
	controlsEnd,
	expanded = false,
	...props
}: MediaHeroProps) => (
	<section className="storyblok__outline full-bleed-hero flex flex-col gap-6" {...props}>
		<div
			className={cn(
				'bg-foreground relative aspect-video max-h-[80vh] min-h-112 w-full overflow-hidden transition-[border-radius] duration-300 ease-out md:min-h-160',
				expanded ? 'z-60' : 'md:rounded-b-5xl rounded-b-3xl',
			)}
		>
			{media ??
				(image ? (
					<NextImage src={image.src} alt={image.alt} fill sizes="100vw" className="object-cover" priority />
				) : (
					<div className="bg-primary/20 absolute inset-0" />
				))}

			<div className={cn('pointer-events-none absolute inset-0', overlayClasses[overlay])} />

			{top && !expanded ? (
				<div className="w-site-width max-w-content absolute inset-x-0 top-10 z-30 mx-auto lg:top-[calc(1.25rem+3.5rem+2.5rem)]">
					{top}
				</div>
			) : null}

			{controlsStart || controlsEnd ? (
				<div className="pointer-events-none absolute inset-x-8 bottom-8 z-30 flex items-center justify-between">
					<div className="pointer-events-auto flex items-center gap-2">{controlsStart}</div>
					<div className="pointer-events-auto flex items-center gap-2">{controlsEnd}</div>
				</div>
			) : null}

			{expanded ? null : (
				<div className={contentVariants({ align })}>
					<div className="flex min-w-0 flex-1 flex-col gap-10">{children}</div>
					{aside ? <div className="hidden shrink-0 lg:block">{aside}</div> : null}
				</div>
			)}
		</div>

		{mobileAside && !expanded ? (
			<div className="lg:hidden">
				<BlockWrapper disableMarginTop disableMarginBottom>
					{mobileAside}
				</BlockWrapper>
			</div>
		) : null}
	</section>
);

const titleVariants = cva('', {
	variants: {
		variant: {
			bold: 'text-5xl leading-tight font-bold text-pretty md:text-6xl',
			light: 'text-4xl xl:text-6xl [&_strong]:font-bold',
		},
	},
});

type MediaHeroIntroProps = {
	title?: ReactNode;
	variant?: 'bold' | 'light';
	// A short line above the title, such as the campaign creator
	kicker?: string;
	eyebrow?: ReactNode;
	titleIcon?: MediaHeroImage;
	description?: string;
	// Lifts the text off busy images
	shadow?: boolean;
	children?: ReactNode;
};

export const MediaHeroIntro = ({
	title,
	variant = 'bold',
	kicker,
	eyebrow,
	titleIcon,
	description,
	shadow = false,
	children,
}: MediaHeroIntroProps) => (
	<div className={cn('flex max-w-2xl flex-col', variant === 'light' ? 'gap-6' : 'gap-4', shadow && 'drop-shadow-on-media')}>
		{eyebrow}
		{kicker ? <p className="text-lg">{kicker}</p> : null}
		{title ? (
			<h1 className={titleVariants({ variant })}>
				{title}
				{titleIcon ? (
					<NextImage
						src={titleIcon.src}
						alt={titleIcon.alt}
						width={44}
						height={32}
						className="ml-3 inline-block h-8 w-11 rounded-sm align-baseline md:ml-4"
					/>
				) : null}
			</h1>
		) : null}
		{description ? <p className="text-xl">{description}</p> : null}
		{children}
	</div>
);

export const MediaHeroChips = ({ children }: { children: ReactNode }) => (
	<div className="flex flex-wrap gap-2">{children}</div>
);

export const MediaHeroPill = ({ children }: { children: ReactNode }) => (
	<span className="text-primary-foreground border-primary-foreground/50 bg-foreground/40 inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs leading-none font-medium">
		{children}
	</span>
);

export const MediaHeroStats = ({ children }: { children: ReactNode }) => (
	<div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-16">{children}</div>
);

type MediaHeroStatProps = {
	label: string;
	value: string;
	// Shown faded next to the value, e.g. a fundraising goal
	target?: string;
	progress: number;
};

export const MediaHeroStat = ({ label, value, target, progress }: MediaHeroStatProps) => (
	<div className="flex min-w-0 flex-1 flex-col gap-3">
		<div className="flex items-end justify-between gap-4">
			<div className="flex min-w-0 flex-col gap-1">
				<p className="text-sm font-medium">{label}</p>
				<p className="text-4xl font-normal md:text-6xl">{value}</p>
			</div>
			{target ? <p className="pb-1 text-xl font-medium opacity-40">{target}</p> : null}
		</div>
		<Progress value={progress} variant="onDark" />
	</div>
);
