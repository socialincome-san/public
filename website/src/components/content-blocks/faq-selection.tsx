'use client';

import { BlockWrapper } from '@/components/block-wrapper';
import { FaqSelectionContent } from '@/components/content-blocks/faq-selection-content';
import { resolveFaqItems } from '@/components/content-blocks/faq-selection.utils';
import type { FaqSelection } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { resolveStoryblokLink } from '@/lib/services/storyblok/storyblok.utils';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';

type Props = {
	blok: FaqSelection;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const FaqSelectionBlock = ({ blok, lang, region }: Props) => {
	const items = resolveFaqItems(blok.questions);
	const button = blok.button?.[0];
	const buttonHref = button?.link ? resolveStoryblokLink(button.link, lang, region) : null;
	const cta = button && buttonHref && button.label ? { href: buttonHref, label: button.label } : undefined;

	if (!items.length) {
		return null;
	}

	return (
		<BlockWrapper {...storyblokEditable(blok as SbBlokData)}>
			<FaqSelectionContent heading={blok.heading} items={items} cta={cta} />
		</BlockWrapper>
	);
};
