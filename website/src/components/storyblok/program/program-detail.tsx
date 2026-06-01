import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { buildBreadcrumbLinks } from '@/components/breadcrumb/build-breadcrumb-links';
import { HeroDonationsHeader } from '@/components/storyblok/shared/hero-donations-header';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import type { PublicProgramStats } from '@/lib/services/program/program.types';
import { getCountryNameByCode } from '@/lib/types/country';

type Props = {
	title: string;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	fullSlug: string;
	heroImageFilename?: string;
	heroImageAlt: string;
	stats?: PublicProgramStats;
};

export const ProgramDetail = async ({ title, lang, region, fullSlug, heroImageFilename, heroImageAlt, stats }: Props) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });
	const breadcrumbLinks = await buildBreadcrumbLinks({
		fullSlug,
		currentLabel: title,
		lang,
		region,
	});

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
									label:
										stats.recipientsCount === 1
											? translator.t('programs-page.recipient-singular')
											: translator.t('programs-page.recipient-plural'),
								},
							]
						: []
				}
			/>
			<div className="max-w-content 2xl:w-site-width ml-[2vw] pl-8 2xl:mx-auto">
				<Breadcrumb links={breadcrumbLinks} />
			</div>
		</>
	);
};
