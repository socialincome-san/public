import type { ImageGeneratorGallery } from '@/generated/storyblok/types/109655/image-generator-gallery';
import { getSafeNumberFormatLocale, type WebsiteLanguage } from '@/lib/i18n/utils';
import { getImageGeneratorGalleryAction } from '@/modules/image-generator-gallery/image-generator-gallery.actions';
import { ImageGallery } from '@socialincome/design-system/data-display/image-gallery/image-gallery';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { storyblokEditable } from '@storyblok/react';
import { getTranslations } from 'next-intl/server';

type Props = {
	blok: ImageGeneratorGallery;
	lang: WebsiteLanguage;
};

export const ImageGeneratorGalleryBlock = async ({ blok, lang }: Props) => {
	const result = await getImageGeneratorGalleryAction();
	if (!result.success || result.data.length === 0) {
		return null;
	}

	const t = await getTranslations({ locale: lang, namespace: 'website-image-gallery' });
	const priceFormatter = new Intl.NumberFormat(getSafeNumberFormatLocale(lang), {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
	const images = result.data.map((image) => ({
		id: String(image.id),
		src: image.previewUrl,
		alt: image.prompt ?? '',
		price:
			image.costUsd === null ? t('priceUnavailable') : t('generatedFor', { amount: priceFormatter.format(image.costUsd) }),
		prompt: image.prompt ? { text: image.prompt, title: t('promptTitle'), triggerLabel: t('showPrompt') } : undefined,
	}));

	return (
		<BlockWrapper {...storyblokEditable(blok)}>
			<ImageGallery
				images={images}
				loadingLabel={t('loading')}
				errorLabel={t('imageError')}
				density="compact"
				pagination={{ pageSize: 24, loadMoreLabel: t('loadMore') }}
			/>
		</BlockWrapper>
	);
};
