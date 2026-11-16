type SummaryHeadingProps = {
	title: string;
	// Sits at the end of the line, e.g. a secondary count
	detail?: string;
};

export const SummaryHeading = ({ title, detail }: SummaryHeadingProps) => (
	<div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
		<p className="text-foreground text-xl leading-none font-bold sm:text-2xl">{title}</p>
		{detail ? <p className="text-muted-foreground text-xs leading-4">{detail}</p> : null}
	</div>
);
