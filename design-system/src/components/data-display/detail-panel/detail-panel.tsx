import { type ReactNode } from 'react';

type DetailPanelProps = {
	title: string;
	// A key figure shown large below the title
	value?: string;
	children?: ReactNode;
	// Shown next to the content from medium screens, e.g. a map
	media?: ReactNode;
};

export const DetailPanel = ({ title, value, children, media }: DetailPanelProps) => {
	const heading = <h2 className="text-foreground text-xl font-bold">{title}</h2>;

	if (media) {
		return (
			<div className="bg-card flex flex-col items-stretch overflow-hidden rounded-xl p-4 shadow-lg md:flex-row">
				<div className="flex flex-1 flex-col items-start gap-5 lg:p-2">
					{heading}
					{children}
				</div>
				<div className="mt-5 h-[341px] w-full shrink-0 md:mt-0 md:w-[274px]">{media}</div>
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
