import { ProgramRecipientsDialog } from '@/components/storyblok/program/program-recipients-dialog';
import { getCurrentUser } from '@/lib/firebase/current-user';
import type { Translator } from '@/lib/i18n/translator';
import { type WebsiteLanguage, getSafeNumberFormatLocale } from '@/lib/i18n/utils';
import type { PublicRecipientTableView } from '@/lib/services/recipient/recipient-table.types';
import { formatNumberLocale } from '@/lib/utils/string-utils';

type Props = {
	count: number;
	recipientsTable?: PublicRecipientTableView;
	programId?: string;
	translator: Translator;
	lang: WebsiteLanguage;
};

export const ProgramRecipients = async ({ count, recipientsTable, programId, translator, lang }: Props) => {
	const locale = getSafeNumberFormatLocale(lang);
	const user = await getCurrentUser();
	const isLoggedIn = user !== null;
	const hasDialogContent = recipientsTable !== undefined && programId !== undefined;

	return (
		<div className="flex h-full flex-col items-start gap-8 rounded-xl bg-white px-10 pt-8 pb-10 shadow-lg">
			<h2 className="text-foreground text-xl font-bold">{translator.t('navigation.recipients')}</h2>
			<p className="text-foreground text-6xl font-light">{formatNumberLocale(count, locale)}</p>
			{hasDialogContent ? (
				<ProgramRecipientsDialog
					dialogTitle={translator.t('program-detail-page.program-recipients-title')}
					viewDemographicsLabel={translator.t('program-detail-page.view-demographics')}
					manageLabel={
						isLoggedIn ? translator.t('program-detail-page.manage') : translator.t('program-detail-page.login-to-manage')
					}
					manageHref={`/portal/programs/${programId}/recipients`}
					rows={recipientsTable.tableRows}
					totalCount={recipientsTable.totalCount}
				/>
			) : null}
		</div>
	);
};
