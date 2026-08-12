import type { Tag } from '@/generated/storyblok/types/109655/storyblok-components';
import { getWebsiteRootParams } from '@/lib/i18n/website-root-params';
import { createWebsiteJournalTagLink } from '@/lib/services/storyblok/storyblok.utils';
import { cn } from '@/lib/utils/cn';
import type { ISbStoryData } from '@storyblok/js';
import Link from 'next/link';

type Props = {
	tag: ISbStoryData<Tag>;
	variant?: 'hero' | 'default';
};

export const TagBadge = async ({ tag, variant = 'default' }: Props) => {
	const { lang, region } = await getWebsiteRootParams();
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
					? 'text-primary-foreground border-primary-foreground/40 hover:bg-primary-foreground/10 border'
					: 'text-foreground border-border hover:bg-muted/50 border',
			)}
		>
			{label}
		</Link>
	);
};
