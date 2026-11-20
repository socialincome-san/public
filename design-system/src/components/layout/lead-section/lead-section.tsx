import { type ReactNode } from 'react';

type LeadSectionProps = {
	// A short label next to the text, e.g. "About Aminata"
	label: string;
	// The opening, in the normal text color
	children: ReactNode;
	// What follows the opening, set back in a muted color
	rest?: ReactNode;
};

/** A large lead paragraph with a small label beside it. Links inside the text are underlined. */
export const LeadSection = ({ label, children, rest }: LeadSectionProps) => (
	<section className="grid gap-x-10 gap-y-3 md:grid-cols-[11.25rem_minmax(0,1fr)]">
		<p className="text-muted-foreground text-sm md:pt-2.5">{label}</p>
		<p className="text-foreground max-w-[58.75rem] text-2xl leading-snug text-pretty md:text-3xl [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:no-underline">
			{children}
			{rest ? <span className="text-muted-foreground"> {rest}</span> : null}
		</p>
	</section>
);
