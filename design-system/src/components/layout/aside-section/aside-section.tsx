import { type ReactNode } from 'react';
import { SectionHeading } from '../section-heading/section-heading';

type AsideSectionProps = {
	title: string;
	description?: string;
	// Below the description, e.g. a summary of the content
	aside?: ReactNode;
	children: ReactNode;
};

// The aside sticks while a long content column scrolls past it
export const AsideSection = ({ title, description, aside, children }: AsideSectionProps) => (
	<section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
		<div className="flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
			<SectionHeading align="left" size={4} bold>
				{title}
			</SectionHeading>
			{description ? <p className="text-foreground text-lg">{description}</p> : null}
			{aside}
		</div>
		<div className="min-w-0">{children}</div>
	</section>
);
