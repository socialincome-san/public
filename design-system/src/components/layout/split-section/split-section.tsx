import { type ReactNode } from 'react';
import { cn } from '../../../cn';

type SplitSectionProps = {
	eyebrow: string;
	// Wrap the words to emphasise in <strong>
	headline: ReactNode;
	// Below the headline, e.g. a video link or a certification
	intro?: ReactNode;
	children: ReactNode;
};

export const SplitSection = ({ eyebrow, headline, intro, children }: SplitSectionProps) => (
	<section className="grid gap-8 py-6 sm:grid-cols-2 sm:items-start sm:gap-12 md:gap-20 md:py-10">
		<div className="flex max-w-3xl flex-col gap-3 sm:pt-8">
			<p className="text-foreground text-sm font-medium">{eyebrow}</p>
			<h2 className="text-foreground text-4xl leading-tight font-normal md:text-5xl md:leading-[54px] [&_strong]:font-bold">
				{headline}
			</h2>
			{intro ? <div className="mt-4">{intro}</div> : null}
		</div>
		<div className="flex flex-col gap-4">{children}</div>
	</section>
);

type SplitSectionCardProps = {
	title: string;
	children: ReactNode;
	align?: 'stretch' | 'center';
};

export const SplitSectionCard = ({ title, children, align = 'stretch' }: SplitSectionCardProps) => (
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
