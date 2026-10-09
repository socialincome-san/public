import type { Tag } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteCurrency } from '@/lib/i18n/utils';
import { createWebsiteJournalTagLink } from '@/lib/storyblok/storyblok-utils';
import { cn } from '@socialincome/design-system/cn';
import type { ISbStoryData } from '@storyblok/js';
import Link from 'next/link';

type Props = {
	tag: ISbStoryData<Tag>;
	lang: string;
	currency: WebsiteCurrency;
	variant?: 'hero' | 'default';
};

export const TagBadge = ({ tag, lang, currency, variant = 'default' }: Props) => {
	const label = tag.content?.value;
	if (!label) {
		return null;
	}

	return (
		<Link
			href={createWebsiteJournalTagLink(tag.slug, lang, currency)}
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
