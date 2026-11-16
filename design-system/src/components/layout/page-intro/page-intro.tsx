import { cva, type VariantProps } from 'class-variance-authority';
import NextImage from 'next/image';
import { type ReactNode } from 'react';

const pageIntroVariants = cva('', {
	variants: {
		variant: {
			page: 'space-y-5',
			section: 'space-y-4',
		},
	},
});

const eyebrowVariants = cva('text-foreground text-4xl font-bold break-words', {
	variants: {
		variant: {
			page: '',
			section: 'mb-0 lg:mb-4',
		},
	},
});

const headingVariants = cva('text-foreground', {
	variants: {
		variant: {
			page: 'text-5xl leading-tight font-bold md:text-6xl',
			// Set in the regular weight; words wrapped in <strong> are bold
			landing: 'text-5xl leading-tight md:text-6xl [&_strong]:font-bold',
			section: 'text-4xl font-normal break-words',
		},
	},
});

const descriptionVariants = cva('', {
	variants: {
		variant: {
			page: 'text-foreground max-w-2xl text-base leading-6 sm:text-lg sm:leading-7',
			section: 'text-muted-foreground text-base leading-7',
		},
	},
});

type PageIntroProps = {
	title?: ReactNode;
	description?: string;
	eyebrow?: string;
	variant?: NonNullable<VariantProps<typeof headingVariants>['variant']>;
	// Decorative: above the text on small screens, beside it from medium screens up
	illustrationSrc?: string;
	// Below the description, such as a button or a video link
	actions?: ReactNode;
};

export const PageIntro = ({ title, description, eyebrow, variant = 'page', illustrationSrc, actions }: PageIntroProps) => {
	const trimmedTitle = typeof title === 'string' ? title.trim() : title;
	const trimmedDescription = description?.trim();
	const trimmedEyebrow = eyebrow?.trim();
	// Apart from the title, landing looks like page
	const layout = variant === 'section' ? 'section' : 'page';
	const Heading = variant === 'section' ? 'h2' : 'h1';

	if (!trimmedTitle && !trimmedDescription && !trimmedEyebrow) {
		return null;
	}

	const text = (
		<div className={pageIntroVariants({ variant: layout })}>
			{trimmedEyebrow ? <p className={eyebrowVariants({ variant: layout })}>{trimmedEyebrow}</p> : null}
			{trimmedTitle ? <Heading className={headingVariants({ variant })}>{trimmedTitle}</Heading> : null}
			{trimmedDescription ? <p className={descriptionVariants({ variant: layout })}>{trimmedDescription}</p> : null}
			{actions ? <div className="flex flex-wrap items-center gap-x-6 gap-y-4 pt-3">{actions}</div> : null}
		</div>
	);

	if (!illustrationSrc) {
		return text;
	}

	return (
		<div className="grid items-center gap-8 md:grid-cols-2">
			{text}
			<div className="relative order-first h-64 md:order-none md:h-112">
				<NextImage src={illustrationSrc} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-contain" />
			</div>
		</div>
	);
};
