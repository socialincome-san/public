import { ProgramManageLabel } from '@/components/storyblok/program/program-manage-label';
import { ProgramRecipientsDialog } from '@/components/storyblok/program/program-recipients-dialog';
import { type WebsiteLanguage, getSafeNumberFormatLocale } from '@/lib/i18n/utils';
import { formatNumberLocale } from '@/lib/utils/string-utils';
import { DetailPanel } from '@socialincome/design-system/data-display/detail-panel/detail-panel';
import { getTranslations } from 'next-intl/server';

type Props = {
	count: number;
	programId?: string;
	lang: WebsiteLanguage;
};

export const ProgramRecipients = async ({ count, programId, lang }: Props) => {
	const locale = getSafeNumberFormatLocale(lang);
	const t = await getTranslations('website-common');

	return (
		<DetailPanel title={t('navigation.recipients')} value={formatNumberLocale(count, locale)}>
			{programId ? (
				<ProgramRecipientsDialog
					dialogTitle={t('program-detail-page.program-recipients-title')}
					viewDemographicsLabel={t('program-detail-page.view-demographics')}
					manageLabel={<ProgramManageLabel />}
					manageHref={`/portal/programs/${programId}/recipients`}
					programId={programId}
				/>
			) : null}
		</DetailPanel>
	);
};
