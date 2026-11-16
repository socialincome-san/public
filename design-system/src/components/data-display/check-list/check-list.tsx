import { CircleCheckBig } from 'lucide-react';

type CheckListProps = {
	items: string[];
};

export const CheckList = ({ items }: CheckListProps) => (
	<ul className="flex flex-col gap-3">
		{items.map((item) => (
			<li key={item} className="text-foreground flex items-start gap-2.5 text-sm font-medium">
				<CircleCheckBig className="mt-0.5 size-4 shrink-0" aria-hidden />
				{item}
			</li>
		))}
	</ul>
);
