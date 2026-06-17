import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { buildBreadcrumbLinks } from '@/components/breadcrumb/build-breadcrumb-links';
import { resolveProgramCountry } from '@/components/storyblok/country/resolve-country-name';
import type { ProgramDetailData } from '@/components/storyblok/program/load-program-detail-data';
import { ProgramAbout } from '@/components/storyblok/program/program-about';
import { ProgramCountry } from '@/components/storyblok/program/program-country';
import { ProgramFinances } from '@/components/storyblok/program/program-finances';
import { ProgramRecipients } from '@/components/storyblok/program/program-recipients';
import { ProgramSurveys } from '@/components/storyblok/program/program-surveys';
import { HeroHeader } from '@/components/storyblok/shared/hero-header';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getCountryNameByCode } from '@/lib/types/country';

type Props = {
	programDetailData: ProgramDetailData;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const ProgramDetail = async ({ programDetailData, lang, region }: Props) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });
	const countryIsoCode = programDetailData.programDetails?.countryIsoCode ?? programDetailData.stats?.countryIsoCode;
	const recipientsCount =
		programDetailData.dashboardStats?.recipientsCount ??
		programDetailData.programDetails?.recipientsCount ??
		programDetailData.stats?.recipientsCount ??
		0;
	const completedSurveysCount =
		programDetailData.dashboardStats?.completedSurveysCount ?? programDetailData.programDetails?.completedSurveysCount ?? 0;

	const [breadcrumbLinks, resolvedCountry] = await Promise.all([
		buildBreadcrumbLinks({
			fullSlug: programDetailData.fullSlug,
			currentLabel: programDetailData.title,
			lang,
			region,
		}),
		resolveProgramCountry(countryIsoCode, lang, region),
	]);

	return (
		<>
			<HeroHeader
				title={programDetailData.title}
				heroImage={programDetailData.heroImage}
				stats={
					programDetailData.stats
						? [
								{
									label: getCountryNameByCode(programDetailData.stats.countryIsoCode),
								},
								{
									value: programDetailData.stats.recipientsCount,
									label:
										programDetailData.stats.recipientsCount === 1
											? translator.t('programs-page.recipient-singular')
											: translator.t('programs-page.recipient-plural'),
								},
							]
						: []
				}
			/>
			<div className="max-w-content 2xl:w-site-width mx-[2vw] mb-6 px-8 2xl:mx-auto">
				<Breadcrumb links={breadcrumbLinks} />
				<div className="grid grid-cols-1 gap-7 lg:grid-cols-2">
					<div className="flex flex-col gap-7">
						{programDetailData.dashboardStats ? (
							<ProgramFinances
								stats={programDetailData.dashboardStats}
								payoutForecast={programDetailData.payoutForecast}
								programId={programDetailData.programId}
								translator={translator}
								lang={lang}
							/>
						) : null}
						<ProgramAbout
							programDetailData={programDetailData}
							translator={translator}
							lang={lang}
							region={region}
							resolvedCountry={resolvedCountry}
						/>
					</div>
					<div className="flex flex-col gap-7">
						{resolvedCountry ? <ProgramCountry resolvedCountry={resolvedCountry} translator={translator} /> : null}
						<div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
							<ProgramRecipients count={recipientsCount} translator={translator} lang={lang} />
							<ProgramSurveys
								completedCount={completedSurveysCount}
								translator={translator}
								lang={lang}
								region={region}
								programId={programDetailData.programId}
							/>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};
