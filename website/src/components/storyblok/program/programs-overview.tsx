import { Wallet } from '@/components/wallet/wallet';
import { formatWalletAmount } from '@/components/wallet/wallet-format';
import { createWalletImageFromStoryblokAsset } from '@/components/wallet/wallet-image-utils';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import type { PublicProgramStatsMap } from '@/lib/services/program/program.types';
import { getCountryNameByCode } from '@/lib/types/country';
import type { ProgramStory } from './program.types';
import { getProgramPortalSlug, getProgramStoryblokSlug, getProgramTitle } from './program.utils';

type Props = {
	programs: ProgramStory[];
	statsByPortalSlug: PublicProgramStatsMap;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const ProgramsOverview = async ({ programs, statsByPortalSlug, lang, region }: Props) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });

	return (
		<div className="flex w-full flex-col gap-6">
			{programs.length === 0 ? (
				<p className="text-muted-foreground">{translator.t('programs-page.empty')}</p>
			) : (
				<ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
					{programs.map((program) => {
						const portalSlug = getProgramPortalSlug(program.content);
						const programTitle = getProgramTitle(program.content);
						const storyblokSlug = getProgramStoryblokSlug(program);
						const stats = portalSlug ? statsByPortalSlug[portalSlug] : undefined;
						const primaryImage = createWalletImageFromStoryblokAsset(program.content.primaryImage, programTitle);
						const hoverEffectImage1 = createWalletImageFromStoryblokAsset(
							program.content.secondaryImage,
							programTitle,
							primaryImage,
							{ preserveFallbackAlt: true },
						);
						const hoverEffectImage2 = createWalletImageFromStoryblokAsset(
							program.content.tertiaryImage,
							programTitle,
							primaryImage,
							{ preserveFallbackAlt: true },
						);
						const linkHref = `/${lang}/${region}/programs/${storyblokSlug}`;
						const images = primaryImage
							? {
									primaryImage,
									hoverEffectImage1: hoverEffectImage1 ?? primaryImage,
									hoverEffectImage2: hoverEffectImage2 ?? primaryImage,
								}
							: undefined;

						return (
							<li key={program.uuid} className="h-full">
								<Wallet
									href={linkHref}
									title={programTitle}
									subtitle={stats ? getCountryNameByCode(stats.countryIsoCode) : undefined}
									footerLeft={
										stats
											? {
													label: translator.t('wallet.paid-out'),
													prefix: stats.payoutCurrency,
													value: formatWalletAmount(stats.totalPayoutsSum),
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
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
};
