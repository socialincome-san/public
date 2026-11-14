import { blockMargins } from '@/components/content-blocks/block-margins';
import type { LinkCards } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { resolveStoryblokLink } from '@/lib/storyblok/storyblok-utils';
import { LinkCard } from '@socialincome/design-system/data-display/link-card/link-card';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { CardGrid, CardGridItem } from '@socialincome/design-system/layout/card-grid/card-grid';
import { storyblokEditable } from '@storyblok/react';
import { getTranslations } from 'next-intl/server';

type Props = {
	blok: LinkCards;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

export const LinkCardsBlock = async ({ blok, lang, currency }: Props) => {
	const t = await getTranslations('website-common');

	return (
		<BlockWrapper {...blockMargins(blok)} {...storyblokEditable(blok)}>
			<CardGrid emptyMessage={t('link-cards.empty')} columns={blok.columns === 'three' ? 'three' : 'auto'}>
				{(blok.cards ?? []).map((card) => (
					<CardGridItem key={card._uid}>
						<LinkCard
							title={card.title}
							description={card.description}
							href={resolveStoryblokLink(card.link, lang, currency)}
							imageSrc={card.image?.filename ?? undefined}
							imageFit={card.imageFit === 'contain' ? 'contain' : 'cover'}
							external={card.newTab}
						/>
					</CardGridItem>
				))}
			</CardGrid>
		</BlockWrapper>
	);
};
