import { Wallet } from '@/components/wallet/wallet';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import type { PublicProgramStatsMap } from '@/lib/services/program/program.types';
import { getCountryNameByCode } from '@/lib/types/country';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';
import type { ProgramStory } from './program.types';
import { getProgramId, getProgramSlug, getProgramTitle } from './program.utils';

type Props = {
	programs: ProgramStory[];
	statsById: PublicProgramStatsMap;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const ProgramsOverview = async ({ programs, statsById, lang, region }: Props) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });

	return (
		<div className="flex w-full flex-col gap-6">
			{programs.length === 0 ? (
				<p className="text-muted-foreground">{translator.t('programs-page.empty')}</p>
			) : (
				<ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
					{programs.map((program) => {
						const programId = getProgramId(program.content);
						const programTitle = getProgramTitle(program.content);
						const programSlug = getProgramSlug(program);
						const stats = programId ? statsById[programId] : undefined;
						const primaryImageFilename = program.content.primaryImage?.filename;
						const primaryImageAlt = program.content.primaryImage?.alt ?? programTitle;
						const secondaryImageFilename = program.content.secondaryImage?.filename;
						const secondaryImageAlt = program.content.secondaryImage?.alt ?? programTitle;
						const tertiaryImageFilename = program.content.tertiaryImage?.filename;
						const tertiaryImageAlt = program.content.tertiaryImage?.alt ?? programTitle;
						const linkHref = `/${lang}/${region}/${NEW_WEBSITE_SLUG}/programs/${programSlug}`;
						const images = primaryImageFilename
							? {
									primaryImage: { src: primaryImageFilename, alt: primaryImageAlt },
									hoverEffectImage1: {
										src: secondaryImageFilename ?? primaryImageFilename,
										alt: secondaryImageAlt ?? primaryImageAlt,
									},
									hoverEffectImage2: {
										src: tertiaryImageFilename ?? primaryImageFilename,
										alt: tertiaryImageAlt ?? primaryImageAlt,
									},
								}
							: undefined;

						return (
							<li key={program.uuid} className="h-full">
								<Wallet
									linkHref={linkHref}
									programName={programTitle}
									country={stats ? getCountryNameByCode(stats.countryIsoCode) : undefined}
									paidOut={
										stats
											? {
													currency: stats.payoutCurrency,
													amount: stats.totalPayoutsSum,
												}
											: undefined
									}
									amountOfRecipients={
										stats
											? {
													amount: stats.recipientsCount,
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
