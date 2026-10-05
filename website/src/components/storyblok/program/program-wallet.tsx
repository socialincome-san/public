import { Wallet } from '@/components/wallet/wallet';
import { formatWalletAmount } from '@/components/wallet/wallet-format';
import { createWalletImageFromStoryblokAsset } from '@/components/wallet/wallet-image-utils';
import type { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getCountryNameByCode } from '@/lib/types/country';
import type { DisplayAmount } from '@/modules/currency-display/currency-display.types';
import type { PublicProgramStats } from '@/modules/programs/program.types';
import type { ProgramStory } from './program.types';
import { getProgramStoryblokSlug, getProgramTitle } from './program.utils';

type Props = {
	program: ProgramStory;
	stats?: PublicProgramStats;
	walletDisplay?: DisplayAmount;
	translator: Translator;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const ProgramWallet = ({ program, stats, walletDisplay, translator, lang, region }: Props) => {
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

	return (
		<Wallet
			href={`/${lang}/${region}/programs/${storyblokSlug}`}
			title={programTitle}
			subtitle={stats ? getCountryNameByCode(stats.countryIsoCode) : undefined}
			footerLeft={
				stats && walletDisplay
					? {
							label: translator.t('wallet.paid-out'),
							prefix: walletDisplay.currency,
							value: formatWalletAmount(walletDisplay.amount),
						}
					: undefined
			}
			footerRight={
				stats
					? {
							label: translator.t('wallet.recipients'),
							value: formatWalletAmount(stats.recipientsCount),
						}
					: undefined
			}
			images={images}
		/>
	);
};
