import { Badge } from '../badge/badge';

type TagListItem = {
	label: string;
	count?: number;
};

type TagListProps = {
	items: TagListItem[];
	ariaLabel?: string;
};

export const TagList = ({ items, ariaLabel }: TagListProps) => (
	<ul className="flex flex-wrap gap-2" aria-label={ariaLabel}>
		{items.map((item) => (
			<li key={item.label}>
				<Badge size="lg">
					{item.label}
					{item.count !== undefined ? <span className="text-muted-foreground tabular-nums">{item.count}</span> : null}
				</Badge>
			</li>
		))}
	</ul>
);
