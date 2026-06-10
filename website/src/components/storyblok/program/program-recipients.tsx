import type { ProgramDetailLabels } from '@/components/storyblok/program/program-detail-labels';
import { ProgramDetailPill } from '@/components/storyblok/program/program-detail-pill';
import { type WebsiteLanguage, getSafeNumberFormatLocale } from '@/lib/i18n/utils';
import { formatNumberLocale } from '@/lib/utils/string-utils';

type Props = {
	count: number;
	labels: ProgramDetailLabels;
	lang: WebsiteLanguage;
};

export const ProgramRecipients = ({ count, labels, lang }: Props) => {
	const locale = getSafeNumberFormatLocale(lang);

	return (
		<div className="flex h-full flex-col items-start gap-8 rounded-xl bg-white px-10 pt-8 pb-10 shadow-lg">
			<h2 className="text-foreground text-xl font-bold">{labels.recipients}</h2>
			<p className="text-foreground text-6xl font-light">{formatNumberLocale(count, locale)}</p>
			<ProgramDetailPill label={labels.viewDemographics} />
		</div>
	);
};
