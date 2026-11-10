import { cva, type VariantProps } from 'class-variance-authority';
import Image from 'next/image';
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
			page: 'text-5xl md:text-6xl',
			section: 'text-4xl font-normal break-words',
		},
		// The mixed-weight page title matches the home page hero, which keeps the default tight line height
		mixedWeight: {
			true: '',
			false: '',
		},
	},
	compoundVariants: [
		{ variant: 'page', mixedWeight: false, className: 'leading-tight font-bold' },
		{ variant: 'page', mixedWeight: true, className: 'font-normal [&_strong]:font-bold' },
	],
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
	// A string is set fully bold on pages; wrap the words to emphasise in <strong> to bold only those
	title?: ReactNode;
	description?: string;
	eyebrow?: string;
	variant?: NonNullable<VariantProps<typeof pageIntroVariants>['variant']>;
	// Decorative: above the text on small screens, beside it from medium screens up
	illustrationSrc?: string;
	// Below the description, e.g. a video link
	actions?: ReactNode;
};

export const PageIntro = ({ title, description, eyebrow, variant = 'page', illustrationSrc, actions }: PageIntroProps) => {
	const trimmedTitle = typeof title === 'string' ? title.trim() : title;
	const trimmedDescription = description?.trim();
	const trimmedEyebrow = eyebrow?.trim();
	const Heading = variant === 'section' ? 'h2' : 'h1';

	if (!trimmedTitle && !trimmedDescription && !trimmedEyebrow) {
		return null;
	}

	const text = (
		<div className={pageIntroVariants({ variant })}>
			{trimmedEyebrow ? <p className={eyebrowVariants({ variant })}>{trimmedEyebrow}</p> : null}
			{trimmedTitle ? (
				<Heading className={headingVariants({ variant, mixedWeight: typeof trimmedTitle !== 'string' })}>
					{trimmedTitle}
				</Heading>
			) : null}
			{trimmedDescription ? <p className={descriptionVariants({ variant })}>{trimmedDescription}</p> : null}
			{actions ? <div className="pt-3">{actions}</div> : null}
		</div>
	);

	if (!illustrationSrc) {
		return text;
	}

	return (
		<div className="grid items-center gap-8 md:grid-cols-2">
			{text}
			<Image
				src={illustrationSrc}
				alt=""
				width={560}
				height={560}
				className="order-first h-auto max-h-64 w-full object-contain md:order-none md:max-h-112"
			/>
		</div>
	);
};
