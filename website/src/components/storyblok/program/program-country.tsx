import { getCountryDescription, getCountryTitle } from '@/components/storyblok/country/country.utils';
import { MapRectangle } from '@/components/storyblok/country/map-rectangle';
import type { ProgramDetailLabels } from '@/components/storyblok/program/program-detail-labels';
import { ProgramDetailPill } from '@/components/storyblok/program/program-detail-pill';
import { RichTextRenderer } from '@/components/storyblok/rich-text-renderer';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { getCountryNameByCode, isValidCountryCode } from '@/lib/types/country';

type Props = {
	countryIsoCode: string;
	lang: WebsiteLanguage;
	labels: ProgramDetailLabels;
};

export const ProgramCountry = async ({ countryIsoCode, lang, labels }: Props) => {
	if (!countryIsoCode || countryIsoCode === '-') {
		return null;
	}

	const countryResult = await services.storyblok.getCountryByIsoCode(countryIsoCode, lang);

	const countryName = countryResult.success
		? getCountryTitle(countryResult.data.content)
		: isValidCountryCode(countryIsoCode)
			? getCountryNameByCode(countryIsoCode)
			: countryIsoCode;
	const description = countryResult.success ? getCountryDescription(countryResult.data.content) : undefined;

	return (
		<div className="flex flex-col items-stretch overflow-hidden rounded-xl bg-white p-3 shadow-lg md:flex-row md:py-3 md:pr-3 md:pl-0">
			<div className="flex flex-1 flex-col items-start gap-5 px-7 pt-5 pb-2 md:px-10 md:pt-8">
				<h2 className="text-foreground text-xl font-bold">{countryName}</h2>
				{description ? (
					<div className="text-foreground prose prose-gray max-w-none flex-1 text-base">
						<RichTextRenderer richTextDocument={description} />
					</div>
				) : null}
				<ProgramDetailPill label={labels.countryAnalysis} />
			</div>
			<div className="mt-5 h-[341px] w-full shrink-0 md:mt-0 md:w-[274px]">
				<MapRectangle isoCode={countryIsoCode} countryName={countryName} />
			</div>
		</div>
	);
};
