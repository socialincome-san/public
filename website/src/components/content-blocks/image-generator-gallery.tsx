import type { ImageGeneratorGallery } from '@/generated/storyblok/types/109655/image-generator-gallery';
import { getSafeNumberFormatLocale, TIME_ZONE, type WebsiteLanguage } from '@/lib/i18n/utils';
import { getImageGeneratorGalleryAction } from '@/modules/image-generator-gallery/image-generator-gallery.actions';
import { Button } from '@socialincome/design-system/actions/button/button';
import { ImageGallery } from '@socialincome/design-system/data-display/image-gallery/image-gallery';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@socialincome/design-system/overlays/dropdown-menu/dropdown-menu';
import { storyblokEditable } from '@storyblok/react';
import { ChevronDown, Download } from 'lucide-react';
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
	const priceFormatter = new Intl.NumberFormat(locale, {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
	const dateFormatter = new Intl.DateTimeFormat(locale, {
		dateStyle: 'medium',
		timeStyle: 'short',
		hourCycle: 'h23',
		timeZone: TIME_ZONE,
	});
	const images = result.data.map((image) => {
		const downloadUrl = new URL(image.previewUrl);
		downloadUrl.searchParams.set('download', '1');
		const cost =
			image.costUsd === null ? t('priceUnavailable') : t('generatedFor', { amount: priceFormatter.format(image.costUsd) });

		return {
			id: String(image.id),
			src: image.previewUrl,
			alt: image.prompt ?? '',
			date: image.createdAt ? { value: image.createdAt, label: dateFormatter.format(new Date(image.createdAt)) } : undefined,
			price: image.costUsd === null ? t('priceUnavailable') : `${priceFormatter.format(image.costUsd)} USD`,
			prompt: image.prompt
				? { text: `${cost}\n\n${image.prompt}`, title: t('promptTitle'), triggerLabel: t('showPrompt') }
				: undefined,
			actions: (
				<DropdownMenu modal={false}>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" size="sm">
							<Download aria-hidden="true" /> {t('download')} <ChevronDown aria-hidden="true" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem asChild>
							<a href={downloadUrl.href} download>
								{t('downloadPreview')}
							</a>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
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
