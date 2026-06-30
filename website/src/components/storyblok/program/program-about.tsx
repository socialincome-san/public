import { getCountryNameFromIsoCode, type ResolvedProgramCountry } from '@/components/storyblok/country/resolve-country-name';
import { buildProgramAboutContent } from '@/components/storyblok/program/build-program-about-content';
import type { ProgramDetailData } from '@/components/storyblok/program/load-program-detail-data';
import { ProgramAboutDialog } from '@/components/storyblok/program/program-about-dialog';
import type { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

type Props = {
	programDetailData: ProgramDetailData;
	translator: Translator;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	resolvedCountry?: ResolvedProgramCountry;
};

export const ProgramAbout = ({ programDetailData, translator, lang, region, resolvedCountry }: Props) => {
	const programCountryIsoCode = programDetailData.programDetails?.countryIsoCode;
	const countryName = programCountryIsoCode
		? programCountryIsoCode === resolvedCountry?.isoCode
			? resolvedCountry.name
			: getCountryNameFromIsoCode(programCountryIsoCode)
		: undefined;
	const content = buildProgramAboutContent({ programDetailData, translator, lang, region, countryName });
	const aboutTitle = translator.t('program-detail-page.about-title');
	const hasDialogContent = content.overlaySections.length > 0;

	return (
		<div className="bg-card flex flex-col gap-6 rounded-xl p-4 shadow-lg lg:p-6">
			<h2 className="text-foreground text-xl font-bold">{aboutTitle}</h2>

			{content.description ? <p className="text-foreground text-base">{content.description}</p> : null}

			<dl className="flex flex-col gap-1 text-base">
				{content.cardRows.map((row) => (
					<div key={row.label} className="grid grid-cols-2 gap-2">
						<dt className="font-bold">{row.label}</dt>
						<dd>
							{row.href ? (
								<span className="inline-flex items-center gap-1">
									<Link href={row.href} className="hover:underline">
										{row.value}
									</Link>
									<ExternalLink className="size-4 shrink-0" aria-hidden="true" />
								</span>
							) : (
								row.value
							)}
						</dd>
					</div>
				))}
			</dl>

			{hasDialogContent ? (
				<ProgramAboutDialog
					aboutTitle={aboutTitle}
					viewDetailsLabel={translator.t('program-detail-page.view-details')}
					closeAriaLabel={translator.t('program-detail-page.close')}
					content={content}
				/>
			) : null}
		</div>
	);
};
