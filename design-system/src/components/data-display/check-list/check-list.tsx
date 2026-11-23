import { cva, type VariantProps } from 'class-variance-authority';
import { CircleCheckBig } from 'lucide-react';
import NextImage from 'next/image';
import { type ReactNode } from 'react';

const checkListVariants = cva('flex flex-col', {
	variants: {
		size: {
			default: 'gap-3 text-sm [&_svg]:mt-0.5 [&_svg]:size-4',
			sm: 'gap-2 text-xs [&_svg]:mt-px [&_svg]:size-3.5',
			lg: 'gap-4 text-base [&_svg]:mt-0.5 [&_svg]:size-5',
		},
	},
	defaultVariants: {
		size: 'default',
	},
});

// A seal in place of the check mark, e.g. a certification, linking to the certifier
type SealItem = {
	label: string;
	imageSrc: string;
	href: string;
};

// Another icon in place of the check mark, sized like it, e.g. a heart for a community
type IconItem = {
	label: string;
	icon: ReactNode;
};

type CheckListProps = {
	items: (string | SealItem | IconItem)[];
} & VariantProps<typeof checkListVariants>;

export const CheckList = ({ items, size }: CheckListProps) => (
	<ul className={checkListVariants({ size })}>
		{items.map((item) =>
			typeof item === 'string' ? (
				<li key={item} className="text-foreground flex items-start gap-2.5 font-medium">
					<CircleCheckBig className="shrink-0" aria-hidden />
					{item}
				</li>
			) : 'icon' in item ? (
				<li key={item.label} className="text-foreground flex items-start gap-2.5 font-medium">
					<span className="flex shrink-0">{item.icon}</span>
					{item.label}
				</li>
			) : (
				<li key={item.label} className="text-foreground flex items-center gap-2.5 font-medium">
					{/* Slightly larger than the check marks, so the seal stays legible; the negative margin keeps the text aligned */}
					<NextImage src={item.imageSrc} alt="" width={28} height={28} className="-mx-1 -my-1 size-7 shrink-0" />
					<a
						href={item.href}
						target="_blank"
						rel="noopener noreferrer"
						className="focus-visible:ring-ring rounded-sm hover:underline focus-visible:ring-1 focus-visible:outline-hidden"
					>
						{item.label}
					</a>
				</li>
			),
		)}
	</ul>
);
