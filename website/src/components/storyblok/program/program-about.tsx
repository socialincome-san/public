import { getCountryNameFromIsoCode, type ResolvedProgramCountry } from '@/components/storyblok/country/resolve-country-name';
import { buildProgramAboutContent } from '@/components/storyblok/program/build-program-about-content';
import type { ProgramDetailData } from '@/components/storyblok/program/load-program-detail-data';
import { ProgramAboutDialog } from '@/components/storyblok/program/program-about-dialog';
import { ProgramAboutRowValues } from '@/components/storyblok/program/program-about-row-values';
import { createWalletImageFromStoryblokAsset } from '@/components/wallet/wallet-image-utils';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import type { ProgramFinancesDisplayAmounts } from '@/modules/programs/program.types';
import { DetailPanel } from '@socialincome/design-system/data-display/detail-panel/detail-panel';
import { Wallet } from '@socialincome/design-system/data-display/wallet/wallet';
import { getTranslations } from 'next-intl/server';

type Props = {
	programDetailData: ProgramDetailData;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
	resolvedCountry?: ResolvedProgramCountry;
	financesDisplayAmounts?: ProgramFinancesDisplayAmounts;
};

export const ProgramAbout = async ({
	programDetailData,
	lang,
	currency,
	resolvedCountry,
	financesDisplayAmounts,
}: Props) => {
	const t = await getTranslations('website-common');
	const programCountryIsoCode = programDetailData.programDetails?.countryIsoCode;
	const country = programCountryIsoCode
		? programCountryIsoCode === resolvedCountry?.isoCode
			? { text: resolvedCountry.name, href: resolvedCountry.href }
			: { text: getCountryNameFromIsoCode(programCountryIsoCode) }
		: undefined;
	const content = buildProgramAboutContent({
		programDetailData,
		t,
		lang,
		currency,
		country,
		financesDisplayAmounts,
	});
	const aboutTitle = t('program-detail-page.about-title');
	const { title, images = [] } = programDetailData;
	const [primaryAsset, secondaryAsset, tertiaryAsset] = images;
	const primaryImage = createWalletImageFromStoryblokAsset(primaryAsset, title);
	const walletImages = primaryImage
		? {
				primaryImage,
				hoverEffectImage1:
					createWalletImageFromStoryblokAsset(secondaryAsset, title, primaryImage, { preserveFallbackAlt: true }) ??
					primaryImage,
				hoverEffectImage2:
					createWalletImageFromStoryblokAsset(tertiaryAsset, title, primaryImage, { preserveFallbackAlt: true }) ??
					primaryImage,
			}
		: undefined;
	const hasDialogContent = content.overlaySections.length > 0;

	return (
		<DetailPanel title={aboutTitle}>
			{content.description ? <p className="text-foreground text-base">{content.description}</p> : null}

			<dl className="flex flex-col gap-1 text-base">
				{content.cardRows.map((row) => (
					<div key={row.label} className="grid grid-cols-2 gap-2">
						<dt className="font-bold">{row.label}</dt>
						<dd>
							<ProgramAboutRowValues values={row.values} />
						</dd>
					</div>
				))}
			</dl>

			{hasDialogContent ? (
				<ProgramAboutDialog
					aboutTitle={aboutTitle}
					viewDetailsLabel={t('program-detail-page.view-details')}
					closeAriaLabel={t('program-detail-page.close')}
					content={content}
					wallet={<Wallet size="sm" title={title} images={walletImages} />}
				/>
			) : null}
		</DetailPanel>
	);
};
