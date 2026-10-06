import type { ReactNode } from 'react';

type FoundationPageProps = {
	title: string;
	intro: ReactNode;
	children: ReactNode;
};

export const FoundationPage = ({ title, intro, children }: FoundationPageProps) => (
	<div className="text-foreground flex max-w-5xl flex-col gap-12">
		<header className="flex flex-col gap-3">
			<h1 className="text-4xl font-medium">{title}</h1>
			<div className="text-muted-foreground flex max-w-3xl flex-col gap-2 text-base leading-relaxed">{intro}</div>
		</header>
		{children}
	</div>
);

type FoundationSectionProps = {
	title: string;
	description?: ReactNode;
	children: ReactNode;
};

export const FoundationSection = ({ title, description, children }: FoundationSectionProps) => (
	<section className="flex flex-col gap-4">
		<div className="flex flex-col gap-1">
			<h2 className="text-2xl font-medium">{title}</h2>
			{description ? <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">{description}</p> : null}
		</div>
		{children}
	</section>
);

export const TokenName = ({ children }: { children: ReactNode }) => (
	<code className="bg-muted rounded-sm px-1.5 py-0.5 font-mono text-xs">{children}</code>
);
