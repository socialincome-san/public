import { getCountryNameFromIsoCode, type ResolvedProgramCountry } from '@/components/storyblok/country/resolve-country-name';
import { buildProgramAboutContent } from '@/components/storyblok/program/build-program-about-content';
import type { ProgramDetailData } from '@/components/storyblok/program/load-program-detail-data';
import { ProgramAboutDialog } from '@/components/storyblok/program/program-about-dialog';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { DetailPanel } from '@socialincome/design-system/data-display/detail-panel/detail-panel';
import { ExternalLink } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

type Props = {
	programDetailData: ProgramDetailData;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
	resolvedCountry?: ResolvedProgramCountry;
};

export const ProgramAbout = async ({ programDetailData, lang, currency, resolvedCountry }: Props) => {
	const t = await getTranslations('website-common');
	const programCountryIsoCode = programDetailData.programDetails?.countryIsoCode;
	const countryName = programCountryIsoCode
		? programCountryIsoCode === resolvedCountry?.isoCode
			? resolvedCountry.name
			: getCountryNameFromIsoCode(programCountryIsoCode)
		: undefined;
	const content = buildProgramAboutContent({ programDetailData, t, lang, currency, countryName });
	const aboutTitle = t('program-detail-page.about-title');
	const hasDialogContent = content.overlaySections.length > 0;

	return (
		<DetailPanel title={aboutTitle}>
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
					viewDetailsLabel={t('program-detail-page.view-details')}
					closeAriaLabel={t('program-detail-page.close')}
					content={content}
				/>
			) : null}
		</DetailPanel>
	);
};
