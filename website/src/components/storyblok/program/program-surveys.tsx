import { ProgramDetailPill } from '@/components/storyblok/program/program-detail-pill';
import type { Translator } from '@/lib/i18n/translator';
import { type WebsiteLanguage, getSafeNumberFormatLocale } from '@/lib/i18n/utils';
import { formatNumberLocale } from '@/lib/utils/string-utils';

type Props = {
	completedCount: number;
	translator: Translator;
	lang: WebsiteLanguage;
};

export const ProgramSurveys = ({ completedCount, translator, lang }: Props) => {
	const locale = getSafeNumberFormatLocale(lang);

	return (
		<div className="flex h-full flex-col items-start gap-8 rounded-xl bg-white px-10 pt-8 pb-10 shadow-lg">
			<h2 className="text-foreground text-xl font-bold">{translator.t('program-detail-page.completed-surveys')}</h2>
			<p className="text-foreground text-6xl font-light">{formatNumberLocale(completedCount, locale)}</p>
			<ProgramDetailPill label={translator.t('program-detail-page.view-impact-data')} />
		</div>
	);
};
