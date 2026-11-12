import { type ReactNode } from 'react';
import { cn } from '../../../cn';
import { CardAlertFooter, type CardAlertFooterVariant } from '../../feedback/card-alert-footer/card-alert-footer';

type SplitSectionProps = {
	eyebrow?: string;
	// Wrap the words to emphasise in <strong>
	headline: ReactNode;
	// 1 when the section opens a page
	headingLevel?: 1 | 2;
	// Paragraphs are separated by a blank line
	description?: string;
	// Below the headline, e.g. a video link or a certification
	intro?: ReactNode;
	children: ReactNode;
};

export const SplitSection = ({ eyebrow, headline, headingLevel = 2, description, intro, children }: SplitSectionProps) => {
	const Heading = headingLevel === 1 ? 'h1' : 'h2';

	return (
		<section className="grid gap-8 py-6 sm:grid-cols-2 sm:items-start sm:gap-12 md:gap-20 md:py-10">
			<div className="flex max-w-3xl flex-col gap-3 sm:pt-8">
				{eyebrow ? <p className="text-foreground text-sm font-medium">{eyebrow}</p> : null}
				<Heading className="text-foreground text-4xl leading-tight font-normal md:text-5xl md:leading-[54px] [&_strong]:font-bold">
					{headline}
				</Heading>
				{description ? <p className="text-foreground mt-2 text-lg leading-7 whitespace-pre-line">{description}</p> : null}
				{intro ? <div className="mt-4">{intro}</div> : null}
			</div>
			<div className="flex flex-col gap-4">{children}</div>
		</section>
	);
};

type SplitSectionCardProps = {
	title: string;
	children: ReactNode;
	align?: 'stretch' | 'center';
	// A coloured strip below the card, e.g. a key figure
	status?: { text: string; variant: CardAlertFooterVariant };
};

export const SplitSectionCard = ({ title, children, align = 'stretch', status }: SplitSectionCardProps) => {
	const card = (
		<div
			className={cn(
				'bg-card shadow-card relative flex w-full flex-col gap-6 rounded-4xl px-6 pt-6 pb-8 sm:gap-7 sm:px-8 sm:pt-7 sm:pb-10',
				align === 'center' && 'items-center',
			)}
		>
			<h3 className="text-foreground w-full text-2xl leading-none font-medium">{title}</h3>
			{children}
		</div>
	);

	if (!status) {
		return card;
	}

	return (
		<div className={cn('rounded-4xl', status.variant === 'confirm' ? 'bg-confirm-foreground' : 'bg-secondary')}>
			{card}
			<CardAlertFooter text={status.text} variant={status.variant} inset="lg" />
		</div>
	);
};
