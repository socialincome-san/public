import { ProgramRecipientsDialog } from '@/components/storyblok/program/program-recipients-dialog';
import type { Translator } from '@/lib/i18n/translator';
import { type WebsiteLanguage, getSafeNumberFormatLocale } from '@/lib/i18n/utils';
import { formatNumberLocale } from '@/lib/utils/string-utils';
import { getCurrentUserAction } from '@/modules/auth/auth.actions';
import { DetailPanel } from '@socialincome/design-system/data-display/detail-panel/detail-panel';

type Props = {
	count: number;
	programId?: string;
	translator: Translator;
	lang: WebsiteLanguage;
};

export const ProgramRecipients = async ({ count, programId, translator, lang }: Props) => {
	const locale = getSafeNumberFormatLocale(lang);
	const userResult = await getCurrentUserAction();
	const isLoggedIn = userResult.success && userResult.data !== null;

	return (
		<DetailPanel title={translator.t('navigation.recipients')} value={formatNumberLocale(count, locale)}>
			{programId ? (
				<ProgramRecipientsDialog
					dialogTitle={translator.t('program-detail-page.program-recipients-title')}
					viewDemographicsLabel={translator.t('program-detail-page.view-demographics')}
					manageLabel={
						isLoggedIn ? translator.t('program-detail-page.manage') : translator.t('program-detail-page.login-to-manage')
					}
					manageHref={`/portal/programs/${programId}/recipients`}
					programId={programId}
				/>
			) : null}
		</DetailPanel>
	);
};
