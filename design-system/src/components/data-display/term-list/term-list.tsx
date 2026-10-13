import { type ReactNode } from 'react';

export type TermListItem = {
	label: string;
	value: ReactNode;
	testId?: string;
};

type TermListProps = {
	title: string;
	items: TermListItem[];
	testId?: string;
};

export const TermList = ({ title, items, testId }: TermListProps) => (
	<section className="text-sm" data-testid={testId}>
		<h3 className="pb-3 font-medium">{title}</h3>
		<dl className="divide-y">
			{items.map((item) => (
				<div key={item.label} className="flex justify-between gap-4 py-3">
					<dt>{item.label}</dt>
					<dd className="font-medium" data-testid={item.testId}>
						{item.value}
					</dd>
				</div>
			))}
		</dl>
	</section>
);
