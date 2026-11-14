import { blockMargins } from '@/components/content-blocks/block-margins';
import type { TabNavigation as TabNavigationBlok } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { resolveStoryblokLink } from '@/lib/storyblok/storyblok-utils';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { TabNavigation } from '@socialincome/design-system/navigation/tab-navigation/tab-navigation';
import { storyblokEditable } from '@storyblok/react';
import { getTranslations } from 'next-intl/server';

type Props = {
	blok: TabNavigationBlok;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
	// uuid of the page showing the block; the tab linking to it is highlighted
	storyUuid: string;
};

export const TabNavigationBlock = async ({ blok, lang, currency, storyUuid }: Props) => {
	const t = await getTranslations('website-common');

	return (
		<BlockWrapper {...blockMargins(blok)} {...storyblokEditable(blok)}>
			<div className="flex justify-center">
				<TabNavigation
					variant="segmented"
					label={t('tab-navigation.label')}
					links={(blok.tabs ?? []).map((tab) => ({
						href: resolveStoryblokLink(tab.link, lang, currency),
						label: tab.label,
						active: tab.link.linktype === 'story' && tab.link.id === storyUuid,
					}))}
				/>
			</div>
		</BlockWrapper>
	);
};
