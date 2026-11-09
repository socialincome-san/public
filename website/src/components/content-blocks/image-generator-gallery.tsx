import type { ImageGeneratorGallery } from '@/generated/storyblok/types/109655/storyblok-components';
import { getSafeNumberFormatLocale, TIME_ZONE, type WebsiteLanguage } from '@/lib/i18n/utils';
import { formatCurrencyLocale } from '@/lib/utils/string-utils';
import { getImageGeneratorGalleryAction } from '@/modules/image-generator-gallery/image-generator-gallery.actions';
import { Button } from '@socialincome/design-system/actions/button/button';
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
	const locale = getSafeNumberFormatLocale(lang);
	const dateFormatter = new Intl.DateTimeFormat(locale, {
		dateStyle: 'medium',
		timeStyle: 'short',
		hourCycle: 'h23',
		timeZone: TIME_ZONE,
	});
	const images = result.data.map((image) => {
		const downloadUrl = image.imageUrl ? new URL(image.imageUrl) : null;
		downloadUrl?.searchParams.set('download', '1');
		const price =
			image.costUsd === null
				? t('priceUnavailable')
				: formatCurrencyLocale(image.costUsd, 'USD', locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
		const cost = image.costUsd === null ? price : t('generatedFor', { amount: price });

		return {
			id: String(image.id),
			src: image.previewUrl,
			alt: image.prompt ?? '',
			date: image.createdAt ? { value: image.createdAt, label: dateFormatter.format(new Date(image.createdAt)) } : undefined,
			price,
			prompt: image.prompt
				? { text: `${cost}\n\n${image.prompt}`, title: t('promptTitle'), triggerLabel: t('showPrompt') }
				: undefined,
			actions: downloadUrl ? (
				<Button variant="outline" size="sm" asChild>
					<a href={downloadUrl.href} download>
						{t('download')}
					</a>
				</Button>
			) : undefined,
		};
	});

	return (
		<BlockWrapper {...storyblokEditable(blok)}>
			<ImageGallery
				images={images}
				loadingLabel={t('loading')}
				errorLabel={t('imageError')}
				density="compact"
				infoPlacement="metadata"
				pagination={{ pageSize: 24, loadMoreLabel: t('loadMore') }}
			/>
		</BlockWrapper>
	);
};
