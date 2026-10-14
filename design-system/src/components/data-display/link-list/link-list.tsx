import { ArrowUpRight } from 'lucide-react';
import NextLink from 'next/link';
import { ShowMoreToggle } from '../../actions/show-more-toggle/show-more-toggle';
import { Badge } from '../badge/badge';

type LinkListItem = {
	label: string;
	href: string;
	tags?: string[];
};

type LinkListProps = {
	items: LinkListItem[];
	// Items beyond this count are revealed by the show more button
	initialCount?: number;
	showMoreLabel: string;
	showLessLabel: string;
};

export const LinkList = ({ items, initialCount = 5, showMoreLabel, showLessLabel }: LinkListProps) => (
	<ShowMoreToggle initialCount={initialCount} showMoreLabel={showMoreLabel} showLessLabel={showLessLabel}>
		{items.map((item) => (
			<NextLink
				key={`${item.href}-${item.label}`}
				href={item.href}
				className="group border-border focus-visible:ring-ring flex items-center justify-between gap-4 border-b py-4 focus-visible:ring-2 focus-visible:outline-none"
			>
				<span className="text-foreground flex min-w-0 items-center gap-1 text-lg font-medium group-hover:underline">
					{item.label}
					<ArrowUpRight className="text-muted-foreground size-4 shrink-0" aria-hidden />
				</span>
				{item.tags && item.tags.length > 0 ? (
					<span className="flex flex-wrap justify-end gap-1.5">
						{item.tags.map((tag) => (
							<Badge key={tag} variant="primary-outline">
								{tag}
							</Badge>
						))}
					</span>
				) : null}
			</NextLink>
		))}
	</ShowMoreToggle>
);
