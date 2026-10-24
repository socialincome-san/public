'use client';

import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import { ArrowUpRight } from 'lucide-react';
import NextLink from 'next/link';
import { useState } from 'react';
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
	// `{count}` is replaced with the number of items in the current filter
	showMoreLabel: string;
	showLessLabel: string;
	// Shows the tags with their counts above the list, to narrow it down to one tag
	tagFilter?: { allLabel: string; ariaLabel: string };
};

const ALL_TAGS = '__all__';

const countTags = (items: LinkListItem[]) =>
	items
		.flatMap((item) => item.tags ?? [])
		.reduce((counts, tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1), new Map<string, number>());

const filterChipClassName =
	'border-border text-foreground hover:bg-muted focus-visible:ring-ring data-[state=on]:bg-primary data-[state=on]:border-primary data-[state=on]:text-primary-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none';

const FilterChip = ({ value, label, count }: { value: string; label: string; count: number }) => (
	<ToggleGroupPrimitive.Item value={value} className={filterChipClassName}>
		{label}
		<span className="tabular-nums opacity-70">{count}</span>
	</ToggleGroupPrimitive.Item>
);

export const LinkList = ({ items, initialCount = 5, showMoreLabel, showLessLabel, tagFilter }: LinkListProps) => {
	const [selectedTag, setSelectedTag] = useState(ALL_TAGS);
	const visibleItems = selectedTag === ALL_TAGS ? items : items.filter((item) => item.tags?.includes(selectedTag));
	const tagCounts = countTags(items);

	return (
		<div className="flex flex-col gap-6">
			{tagFilter && tagCounts.size > 0 ? (
				<ToggleGroupPrimitive.Root
					type="single"
					value={selectedTag}
					// Clicking the selected chip again clears the value, which shows all items again
					onValueChange={(value) => setSelectedTag(value || ALL_TAGS)}
					aria-label={tagFilter.ariaLabel}
					className="flex flex-wrap gap-2"
				>
					<FilterChip value={ALL_TAGS} label={tagFilter.allLabel} count={items.length} />
					{[...tagCounts].map(([tag, count]) => (
						<FilterChip key={tag} value={tag} label={tag} count={count} />
					))}
				</ToggleGroupPrimitive.Root>
			) : null}
			<ShowMoreToggle
				// A new filter starts collapsed again
				key={selectedTag}
				initialCount={initialCount}
				showMoreLabel={showMoreLabel.replace('{count}', String(visibleItems.length))}
				showLessLabel={showLessLabel}
			>
				{visibleItems.map((item) => (
					<NextLink
						key={`${item.href}-${item.label}`}
						href={item.href}
						className="group border-border hover:bg-muted/50 focus-visible:ring-ring -mx-3 flex flex-col gap-2 rounded-lg border-b px-3 py-4 transition-colors focus-visible:ring-2 focus-visible:outline-none sm:flex-row sm:items-center sm:justify-between sm:gap-4"
					>
						<span className="text-foreground flex min-w-0 items-center gap-1 text-lg font-medium group-hover:underline">
							{item.label}
							<ArrowUpRight
								className="text-muted-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
								aria-hidden
							/>
						</span>
						{item.tags && item.tags.length > 0 ? (
							<span className="flex flex-wrap gap-1.5 sm:justify-end">
								{item.tags.map((tag) => (
									<Badge key={tag} variant={tag === selectedTag ? 'primary' : 'primary-outline'}>
										{tag}
									</Badge>
								))}
							</span>
						) : null}
					</NextLink>
				))}
			</ShowMoreToggle>
		</div>
	);
};
