'use client';

import type { MenuItem } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { resolveStoryblokLink } from '@/lib/services/storyblok/storyblok.utils';
import NextLink from 'next/link';
import { FC } from 'react';

type Props = {
	item: MenuItem;
	lang: WebsiteLanguage;
	region: string;
	onNavigate: () => void;
};

export const MobileMenuItem: FC<Props> = ({ item, lang, region, onNavigate }) => {
	const href = resolveStoryblokLink(item.link, lang, region);

	return (
		<li className="border-border border-b">
			<NextLink
				href={href}
				target={item.newTab ? '_blank' : undefined}
				rel={item.newTab ? 'noopener noreferrer' : undefined}
				className="block py-5 text-lg font-semibold"
				onClick={onNavigate}
			>
				{item.label}
			</NextLink>
		</li>
	);
};
