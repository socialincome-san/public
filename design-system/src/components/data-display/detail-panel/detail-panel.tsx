import { type ReactNode } from 'react';

type DetailPanelProps = {
	title: string;
	// A key figure shown large below the title
	value?: string;
	children?: ReactNode;
	// Shown between title and content on small screens, next to them from medium screens, e.g. a map
	media?: ReactNode;
};

export const DetailPanel = ({ title, value, children, media }: DetailPanelProps) => {
	const heading = <h2 className="text-foreground text-xl font-bold">{title}</h2>;

	if (media) {
		return (
			<div className="bg-card grid grid-cols-1 gap-5 overflow-hidden rounded-xl p-4 shadow-lg md:grid-cols-[1fr_274px] md:grid-rows-[auto_1fr] md:gap-x-0">
				<div className="lg:px-2 lg:pt-2">{heading}</div>
				<div className="h-[341px] w-full md:col-start-2 md:row-[1/3]">{media}</div>
				<div className="flex flex-col items-start gap-5 lg:px-2 lg:pb-2">{children}</div>
			</div>
		);
	}

	if (value !== undefined) {
		return (
			<div className="bg-card flex h-full flex-col items-start gap-8 rounded-xl p-4 shadow-lg lg:p-6">
				{heading}
				<p className="text-foreground text-6xl font-light">{value}</p>
				{children}
			</div>
		);
	}

	return (
		<div className="bg-card flex flex-col gap-6 rounded-xl p-4 shadow-lg lg:p-6">
			{heading}
			{children}
		</div>
	);
};
