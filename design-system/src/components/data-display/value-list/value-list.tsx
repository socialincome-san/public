import { type ReactNode } from 'react';

// Colors are inherited, so the list works on light surfaces and inside dark tooltips alike
export const ValueList = ({ children }: { children: ReactNode }) => (
	<dl className="grid min-w-40 grid-cols-[1fr_auto] gap-x-6 gap-y-1">{children}</dl>
);

type ValueListRowProps = {
	label: string;
	value: string;
};

export const ValueListRow = ({ label, value }: ValueListRowProps) => (
	<>
		<dt>{label}</dt>
		<dd className="text-right font-medium tabular-nums">{value}</dd>
	</>
);

export const ValueListDivider = () => <div role="presentation" className="col-span-2 my-1 h-px bg-current opacity-30" />;
