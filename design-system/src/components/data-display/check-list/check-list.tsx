import { cva, type VariantProps } from 'class-variance-authority';
import { CircleCheckBig } from 'lucide-react';

const checkListVariants = cva('flex flex-col', {
	variants: {
		size: {
			default: 'gap-3 text-sm [&_svg]:mt-0.5 [&_svg]:size-4',
			sm: 'gap-2 text-xs [&_svg]:mt-px [&_svg]:size-3.5',
		},
	},
	defaultVariants: {
		size: 'default',
	},
});

type CheckListProps = {
	items: string[];
} & VariantProps<typeof checkListVariants>;

export const CheckList = ({ items, size }: CheckListProps) => (
	<ul className={checkListVariants({ size })}>
		{items.map((item) => (
			<li key={item} className="text-foreground flex items-start gap-2.5 font-medium">
				<CircleCheckBig className="shrink-0" aria-hidden />
				{item}
			</li>
		))}
	</ul>
);
