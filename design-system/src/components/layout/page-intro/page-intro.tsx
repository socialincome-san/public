import { cn } from '../../../cn';

type PageIntroProps = {
	title?: string;
	description?: string;
	eyebrow?: string;
	variant?: 'page' | 'section';
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
		<div className={cn(isSection ? 'space-y-4' : 'space-y-5')}>
			{trimmedEyebrow ? <p className="text-foreground text-4xl font-bold break-words">{trimmedEyebrow}</p> : null}
			{trimmedTitle ? (
				<Heading
					className={cn(
						'text-foreground',
						isSection ? 'text-4xl font-normal break-words' : 'text-5xl leading-tight font-bold md:text-6xl',
					)}
				>
					{trimmedTitle}
				</Heading>
			) : null}
			{trimmedDescription ? (
				<p
					className={cn(
						isSection
							? 'text-muted-foreground text-base leading-7'
							: 'text-foreground max-w-2xl text-base leading-6 sm:text-lg sm:leading-7',
					)}
				>
					{trimmedDescription}
				</p>
			) : null}
		</div>
	);
};
