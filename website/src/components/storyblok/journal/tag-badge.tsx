import type { Tag } from '@/generated/storyblok/types/109655/storyblok-components';
import { createWebsiteJournalTagLink } from '@/lib/services/storyblok/storyblok.utils';
import { cn } from '@/lib/utils/cn';
import type { ISbStoryData } from '@storyblok/js';
import Link from 'next/link';

type Props = {
	tag: ISbStoryData<Tag>;
	lang: string;
	region: string;
	variant?: 'hero' | 'default';
};

export const TagBadge = ({ tag, lang, region, variant = 'default' }: Props) => {
	const label = tag.content?.value;
	if (!label) {
		return null;
	}

	return (
		<Link
			href={createWebsiteJournalTagLink(tag.slug, lang, region)}
			className={cn(
				'inline-flex rounded-full px-3 py-1 text-sm font-medium capitalize transition-colors',
				variant === 'hero'
					? 'border border-white/40 text-white hover:bg-white/10'
					: 'bg-muted text-foreground hover:bg-muted/80',
			)}
		>
			{label}
		</Link>
	);
};
