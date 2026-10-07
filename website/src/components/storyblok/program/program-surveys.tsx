import type { Translator } from '@/lib/i18n/translator';
import { type WebsiteLanguage, type WebsiteRegion, getSafeNumberFormatLocale } from '@/lib/i18n/utils';
import { formatNumberLocale } from '@/lib/utils/string-utils';
import { LinkPill } from '@socialincome/design-system/actions/link-pill/link-pill';
import { DetailPanel } from '@socialincome/design-system/data-display/detail-panel/detail-panel';

type Props = {
	completedCount: number;
	translator: Translator;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	programId?: string;
};

export const ProgramSurveys = ({ completedCount, translator, lang, region, programId }: Props) => {
	const locale = getSafeNumberFormatLocale(lang);
	const impactHref = programId
		? { pathname: `/${lang}/${region}/impact-measurement`, query: { program: programId } }
		: undefined;

	return (
		<DetailPanel
			title={translator.t('program-detail-page.completed-surveys')}
			value={formatNumberLocale(completedCount, locale)}
		>
			{impactHref ? <LinkPill href={impactHref} label={translator.t('program-detail-page.view-impact-data')} /> : null}
		</DetailPanel>
	);
};
