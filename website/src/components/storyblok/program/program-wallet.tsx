import { CurrencySwitch } from '@/components/currency/currency-switch';
import { formatWalletAmount } from '@/components/wallet/wallet-format';
import { createWalletImageFromStoryblokAsset } from '@/components/wallet/wallet-image-utils';
import { mapWebsiteCurrencies, type WebsiteCurrency, type WebsiteLanguage, type WebsiteRegion } from '@/lib/i18n/utils';
import { getCountryNameByCode } from '@/lib/types/country';
import type { DisplayAmount } from '@/modules/currency-display/currency-display.types';
import type { PublicProgramStats } from '@/modules/programs/program.types';
import { Wallet } from '@socialincome/design-system/data-display/wallet/wallet';
import { getTranslations } from 'next-intl/server';
import type { ProgramStory } from './program.types';
import { getProgramStoryblokSlug, getProgramTitle } from './program.utils';

type Props = {
	program: ProgramStory;
	stats?: PublicProgramStats;
	walletDisplays?: Record<WebsiteCurrency, DisplayAmount | undefined>;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const ProgramWallet = async ({ program, stats, walletDisplays, lang, region }: Props) => {
	const t = await getTranslations('website-common');
	const programTitle = getProgramTitle(program.content);
	const storyblokSlug = getProgramStoryblokSlug(program);
	const primaryImage = createWalletImageFromStoryblokAsset(program.content.primaryImage, programTitle);
	const hoverEffectImage1 = createWalletImageFromStoryblokAsset(program.content.secondaryImage, programTitle, primaryImage, {
		preserveFallbackAlt: true,
	});
	const hoverEffectImage2 = createWalletImageFromStoryblokAsset(program.content.tertiaryImage, programTitle, primaryImage, {
		preserveFallbackAlt: true,
	});
	const images = primaryImage
		? {
				primaryImage,
				hoverEffectImage1: hoverEffectImage1 ?? primaryImage,
				hoverEffectImage2: hoverEffectImage2 ?? primaryImage,
			}
		: undefined;

	const renderWallet = (displayCurrency: WebsiteCurrency) => {
		const walletDisplay = walletDisplays?.[displayCurrency];

		return (
			<Wallet
				href={`/${lang}/${region}/programs/${storyblokSlug}`}
				title={programTitle}
				subtitle={stats ? getCountryNameByCode(stats.countryIsoCode) : undefined}
				footerLeft={
					stats && walletDisplay
						? {
								label: t('wallet.paid-out'),
								prefix: walletDisplay.currency,
								value: formatWalletAmount(walletDisplay.amount),
							}
						: undefined
				}
				footerRight={
					stats
						? {
								label: t('wallet.recipients'),
								value: formatWalletAmount(stats.recipientsCount),
							}
						: undefined
				}
				images={images}
			/>
		);
	};

	return <CurrencySwitch variants={mapWebsiteCurrencies(renderWallet)} />;
};
