import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { buildBreadcrumbLinks } from '@/components/breadcrumb/build-breadcrumb-links';
import { getCountryDescription, getCountryTitle } from '@/components/storyblok/country/country.utils';
import { ProgramAbout } from '@/components/storyblok/program/program-about';
import { ProgramCountry } from '@/components/storyblok/program/program-country';
import { buildProgramDetailLabels } from '@/components/storyblok/program/program-detail-labels';
import { ProgramFinances } from '@/components/storyblok/program/program-finances';
import { ProgramRecipients } from '@/components/storyblok/program/program-recipients';
import { ProgramSurveys } from '@/components/storyblok/program/program-surveys';
import { HeroDonationsHeader } from '@/components/storyblok/shared/hero-donations-header';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import type { ProgramDashboardStats } from '@/lib/services/program-stats/program-stats.types';
import type { PublicProgramDetails, PublicProgramStats } from '@/lib/services/program/program.types';
import { services } from '@/lib/services/services';
import { resolveStoryblokLink } from '@/lib/services/storyblok/storyblok.utils';
import { getCountryNameByCode, isValidCountryCode } from '@/lib/types/country';

type Props = {
	title: string;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	fullSlug: string;
	heroImageFilename?: string;
	heroImageAlt: string;
	stats?: PublicProgramStats;
	dashboardStats?: ProgramDashboardStats;
	programDetails?: PublicProgramDetails;
	description?: string;
};

export const ProgramDetail = async ({
	title,
	lang,
	region,
	fullSlug,
	heroImageFilename,
	heroImageAlt,
	stats,
	dashboardStats,
	programDetails,
	description,
}: Props) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });
	const labels = buildProgramDetailLabels(translator);
	const countryIsoCode = programDetails?.countryIsoCode ?? stats?.countryIsoCode;
	const recipientsCount = dashboardStats?.recipientsCount ?? programDetails?.recipientsCount ?? stats?.recipientsCount ?? 0;
	const completedSurveysCount = dashboardStats?.completedSurveysCount ?? programDetails?.completedSurveysCount ?? 0;

	const [breadcrumbLinks, countryResult, localPartnerStoryResult] = await Promise.all([
		buildBreadcrumbLinks({
			fullSlug,
			currentLabel: title,
			lang,
			region,
		}),
		countryIsoCode && countryIsoCode !== '-'
			? services.storyblok.getCountryByIsoCode(countryIsoCode, lang)
			: Promise.resolve(undefined),
		programDetails?.localPartnerSlug
			? services.storyblok.getLocalPartnerBySlug(programDetails.localPartnerSlug, lang)
			: Promise.resolve(undefined),
	]);

	let localPartnerWebsiteHref: string | undefined;
	if (localPartnerStoryResult?.success) {
		const resolvedHref = resolveStoryblokLink(localPartnerStoryResult.data.content.website, lang, region);
		if (resolvedHref !== '#') {
			localPartnerWebsiteHref = resolvedHref;
		}
	}

	const countryName = countryResult?.success
		? getCountryTitle(countryResult.data.content)
		: countryIsoCode && isValidCountryCode(countryIsoCode)
			? getCountryNameByCode(countryIsoCode)
			: countryIsoCode;
	const countryDescription = countryResult?.success ? getCountryDescription(countryResult.data.content) : undefined;

	return (
		<>
			<HeroDonationsHeader
				lang={lang}
				title={title}
				heroImageFilename={heroImageFilename}
				heroImageAlt={heroImageAlt}
				stats={
					stats
						? [
								{
									label: getCountryNameByCode(stats.countryIsoCode),
								},
								{
									value: stats.recipientsCount,
									label: stats.recipientsCount === 1 ? labels.recipientSingular : labels.recipientPlural,
								},
							]
						: []
				}
			/>
			<div className="max-w-content 2xl:w-site-width mx-[2vw] mb-6 px-8 2xl:mx-auto">
				<Breadcrumb links={breadcrumbLinks} />
				<div className="grid grid-cols-1 gap-7 lg:grid-cols-2">
					<div className="flex flex-col gap-7">
						{dashboardStats ? <ProgramFinances stats={dashboardStats} labels={labels} /> : null}
						{programDetails ? (
							<ProgramAbout
								description={description}
								programDetails={programDetails}
								dashboardStats={dashboardStats}
								localPartnerWebsiteHref={localPartnerWebsiteHref}
								labels={labels}
								lang={lang}
								region={region}
							/>
						) : null}
					</div>
					<div className="flex flex-col gap-7">
						{countryIsoCode && countryName ? (
							<ProgramCountry
								countryIsoCode={countryIsoCode}
								countryName={countryName}
								description={countryDescription}
								labels={labels}
							/>
						) : null}
						<div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
							<ProgramRecipients count={recipientsCount} labels={labels} />
							<ProgramSurveys completedCount={completedSurveysCount} labels={labels} />
						</div>
					</div>
				</div>
			</div>
		</>
	);
};
