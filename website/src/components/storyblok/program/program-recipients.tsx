import { ProgramRecipientsDialog } from '@/components/storyblok/program/program-recipients-dialog';
import { type WebsiteLanguage, getSafeNumberFormatLocale } from '@/lib/i18n/utils';
import { formatNumberLocale } from '@/lib/utils/string-utils';
import { getCurrentUserAction } from '@/modules/auth/auth.actions';
import { DetailPanel } from '@socialincome/design-system/data-display/detail-panel/detail-panel';
import { getTranslations } from 'next-intl/server';

type Props = {
	count: number;
	programId?: string;
	lang: WebsiteLanguage;
};

export const ProgramRecipients = async ({ count, programId, lang }: Props) => {
	const locale = getSafeNumberFormatLocale(lang);
	const [t, userResult] = await Promise.all([getTranslations('website-common'), getCurrentUserAction()]);
	const isLoggedIn = userResult.success && userResult.data !== null;

	return (
		<DetailPanel title={t('navigation.recipients')} value={formatNumberLocale(count, locale)}>
			{programId ? (
				<ProgramRecipientsDialog
					dialogTitle={t('program-detail-page.program-recipients-title')}
					viewDemographicsLabel={t('program-detail-page.view-demographics')}
					manageLabel={isLoggedIn ? t('program-detail-page.manage') : t('program-detail-page.login-to-manage')}
					manageHref={`/portal/programs/${programId}/recipients`}
					programId={programId}
				/>
			) : null}
		</DetailPanel>
	);
};
