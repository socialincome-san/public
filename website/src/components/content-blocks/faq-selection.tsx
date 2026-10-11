'use client';

import { FaqSelectionContent } from '@/components/content-blocks/faq-selection-content';
import { resolveFaqItems } from '@/components/content-blocks/faq-selection.utils';
import type { FaqSelection } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { resolveStoryblokLink } from '@/lib/storyblok/storyblok-utils';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { storyblokEditable } from '@storyblok/react';

type Props = {
	blok: FaqSelection;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

export const FaqSelectionBlock = ({ blok, lang, currency }: Props) => {
	const items = resolveFaqItems(blok.questions);
	const button = blok.button?.[0];
	const buttonHref = button?.link ? resolveStoryblokLink(button.link, lang, currency) : null;
	const cta = button && buttonHref && button.label ? { href: buttonHref, label: button.label } : undefined;

	if (!items.length) {
		return null;
	}

	return (
		<BlockWrapper
			disableMarginTop={blok.disableMarginTop === true}
			disableMarginBottom={blok.disableMarginBottom === true}
			{...storyblokEditable(blok)}
		>
			<FaqSelectionContent heading={blok.heading} items={items} cta={cta} />
		</BlockWrapper>
	);
};
