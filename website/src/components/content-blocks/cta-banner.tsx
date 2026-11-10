import { BlockButton, hasBlockButton } from '@/components/content-blocks/block-button';
import { blockMargins } from '@/components/content-blocks/block-margins';
import type { CtaBanner } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { CtaBanner as CtaBannerView } from '@socialincome/design-system/layout/cta-banner/cta-banner';
import { storyblokEditable } from '@storyblok/react';

type Props = {
	blok: CtaBanner;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

export const CtaBannerBlock = ({ blok, lang, currency }: Props) => {
	const button = blok.button?.[0];
	if (!blok.title || !hasBlockButton(button, blok.buttonAction, lang, currency)) {
		return null;
	}

	return (
		<BlockWrapper {...blockMargins(blok)} {...storyblokEditable(blok)}>
			<CtaBannerView
				title={blok.title}
				description={blok.description}
				image={blok.image?.filename ? { src: blok.image.filename, alt: blok.image.alt ?? '' } : undefined}
				action={
					<BlockButton button={button} action={blok.buttonAction} variant="secondary" lang={lang} currency={currency} />
				}
			/>
		</BlockWrapper>
	);
};
