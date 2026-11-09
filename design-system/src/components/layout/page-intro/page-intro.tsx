import { cva, type VariantProps } from 'class-variance-authority';

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
	title?: string;
	description?: string;
	eyebrow?: string;
	variant?: NonNullable<VariantProps<typeof pageIntroVariants>['variant']>;
};

export const PageIntro = ({ title, description, eyebrow, variant = 'page' }: PageIntroProps) => {
	const trimmedTitle = title?.trim();
	const trimmedDescription = description?.trim();
	const trimmedEyebrow = eyebrow?.trim();
	const isSection = variant === 'section';
	const Heading = isSection ? 'h2' : 'h1';

	if (!trimmedTitle && !trimmedDescription && !trimmedEyebrow) {
		return null;
	}

	return (
		<div className={pageIntroVariants({ variant })}>
			{trimmedEyebrow ? <p className={eyebrowVariants({ variant })}>{trimmedEyebrow}</p> : null}
			{trimmedTitle ? <Heading className={headingVariants({ variant })}>{trimmedTitle}</Heading> : null}
			{trimmedDescription ? <p className={descriptionVariants({ variant })}>{trimmedDescription}</p> : null}
		</div>
	);
};
