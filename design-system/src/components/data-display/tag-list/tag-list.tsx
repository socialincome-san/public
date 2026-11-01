import { ArrowUpRight } from 'lucide-react';
import NextLink from 'next/link';
import { Badge } from '../badge/badge';

export type TagListItem = {
	label: string;
	count?: number;
	// `solid` and `light` set tags apart from the default ones, e.g. circles someone is active or only interested in
	variant?: 'default' | 'solid' | 'light';
	href?: string;
};

const badgeVariants = {
	default: 'default',
	solid: 'primary',
	light: 'country',
} as const;

type TagListProps = {
	items: TagListItem[];
	ariaLabel?: string;
};

export const TagList = ({ items, ariaLabel }: TagListProps) => (
	<ul className="flex flex-wrap gap-2" aria-label={ariaLabel}>
		{items.map((item) => {
			const badge = (
				<Badge size="lg" variant={badgeVariants[item.variant ?? 'default']}>
					{item.label}
					{item.count !== undefined ? <span className="text-muted-foreground tabular-nums">{item.count}</span> : null}
					{item.href ? <ArrowUpRight className="size-3" aria-hidden /> : null}
				</Badge>
			);

			return (
				<li key={item.label}>
					{item.href ? (
						<NextLink
							href={item.href}
							className="focus-visible:ring-ring block rounded-full focus-visible:ring-2 focus-visible:outline-none"
						>
							{badge}
						</NextLink>
					) : (
						badge
					)}
				</li>
			);
		})}
	</ul>
);
