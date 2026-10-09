import type { ReactNode } from 'react';
import { useComputedStyle } from './measure';

export const FoundationPage = ({
	title,
	description,
	children,
}: {
	title: string;
	description: ReactNode;
	children: ReactNode;
}) => (
	<div className="text-foreground flex max-w-5xl flex-col gap-10">
		<header className="flex flex-col gap-2">
			<h1 className="text-3xl font-medium">{title}</h1>
			<p className="text-muted-foreground max-w-2xl text-sm">{description}</p>
		</header>
		{children}
	</div>
);

export const FoundationSection = ({ title, children }: { title: string; children: ReactNode }) => (
	<section className="flex flex-col gap-3">
		<h2 className="text-lg font-medium">{title}</h2>
		{children}
	</section>
);

export const Code = ({ children }: { children: ReactNode }) => (
	<code className="bg-muted rounded-sm px-1.5 py-0.5 font-mono text-xs">{children}</code>
);

export const TokenTable = ({ children }: { children: ReactNode }) => (
	<div className="border-border divide-border divide-y rounded-xl border">{children}</div>
);

type ComputedProperty = 'fontSize' | 'lineHeight' | 'borderTopLeftRadius' | 'width';

type TokenRowProps = {
	name: string;
	// A literal class name, so Tailwind generates it
	previewClass: string;
	// Shown as is, or read from the rendered preview
	value?: string;
	property?: ComputedProperty;
	formatValue?: (value: string) => string;
	children?: ReactNode;
};

export const TokenRow = ({ name, previewClass, value, property, formatValue = (raw) => raw, children }: TokenRowProps) => {
	const [ref, style] = useComputedStyle();
	const computedValue = style && property ? formatValue(style[property]) : '';

	return (
		<div className="grid grid-cols-[11rem_7rem_1fr] items-center gap-4 px-4 py-3">
			<span>
				<Code>{name}</Code>
			</span>
			<span className="text-muted-foreground font-mono text-xs">{value ?? computedValue}</span>
			<div className="min-w-0">
				<div ref={ref} className={previewClass}>
					{children}
				</div>
			</div>
		</div>
	);
};
