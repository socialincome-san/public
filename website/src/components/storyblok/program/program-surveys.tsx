import { getSafeNumberFormatLocale, getWebsiteBasePath, type WebsiteCurrency, type WebsiteLanguage } from '@/lib/i18n/utils';
import { formatNumberLocale } from '@/lib/utils/string-utils';
import { LinkPill } from '@socialincome/design-system/actions/link-pill/link-pill';
import { DetailPanel } from '@socialincome/design-system/data-display/detail-panel/detail-panel';
import { getTranslations } from 'next-intl/server';

type Props = {
	completedCount: number;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
	programId?: string;
};

export const ProgramSurveys = async ({ completedCount, lang, currency, programId }: Props) => {
	const t = await getTranslations('website-common');
	const locale = getSafeNumberFormatLocale(lang);
	const impactHref = programId
		? { pathname: `${getWebsiteBasePath(lang, currency)}/impact-measurement`, query: { program: programId } }
		: undefined;

	return (
		<DetailPanel title={t('program-detail-page.completed-surveys')} value={formatNumberLocale(completedCount, locale)}>
			{impactHref ? <LinkPill href={impactHref} label={t('program-detail-page.view-impact-data')} /> : null}
		</DetailPanel>
	);
};
