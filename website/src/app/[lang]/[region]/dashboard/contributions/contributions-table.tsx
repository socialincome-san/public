import { makeYourContributionsColumns } from '@/components/data-table/columns/your-contributions';
import DataTable from '@/components/data-table/data-table';
import { getAuthenticatedContributorOrRedirect } from '@/lib/firebase/current-contributor';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { ContributionService } from '@/lib/services/contribution/contribution.service';
import { YourContributionsTableViewRow } from '@/lib/services/contribution/contribution.types';
import { PlusIcon } from 'lucide-react';

export const ContributionsTable = async ({ lang }: { lang: WebsiteLanguage }) => {
	const contributor = await getAuthenticatedContributorOrRedirect();

	const translator = await Translator.getInstance({ language: lang as WebsiteLanguage, namespaces: ['website-me'] });

	const service = new ContributionService();
	const result = await service.getYourContributionsTableView(contributor.id);

	const error = result.success ? null : result.error;
	const rows: YourContributionsTableViewRow[] = result.success ? result.data.tableRows : [];

	return (
		<DataTable
			title={translator.t('sections.contributions.payments')}
			error={error}
			emptyMessage={translator.t('contributions.no-contributions')}
			data={rows}
			actionMenuItems={[
				{
					label: translator.t('contributions.new-contribution'),
					icon: <PlusIcon />,
					href: '/donate/individual',
				},
			]}
			makeColumns={makeYourContributionsColumns}
			lang={lang}
		/>
	);
};
