import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { getServices } from '@/lib/services/services';
import { getYourContributionsTableConfig } from '@/components/data-table/configs/your-contributions-table.config';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { getAuthenticatedContributorOrRedirect } from '@/lib/firebase/current-contributor';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';

import { YourContributionsTableViewRow } from '@/lib/services/contribution/contribution.types';
import { PlusIcon } from 'lucide-react';

export const ContributionsTable = async ({
	lang,
	searchParams,
}: {
	lang: WebsiteLanguage;
	searchParams: Promise<Record<string, string>>;
}) => {
	const contributor = await getAuthenticatedContributorOrRedirect();
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const translator = await Translator.getInstance({ language: lang as WebsiteLanguage, namespaces: ['website-me'] });
	const config = getYourContributionsTableConfig({
		title: translator.t('sections.contributions.payments'),
		emptyMessage: translator.t('contributions.no-contributions'),
	});

	
	const result = await getServices().contributionRead.getPaginatedYourContributionsTableView(contributor.id, tableQuery);

	const error = result.success ? null : result.error;
	const rows: YourContributionsTableViewRow[] = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;

	return (
		<ConfiguredDataTableClient
			config={config}
			rows={rows}
			error={error}
			query={{ ...tableQuery, totalRows }}
			actionMenuItems={[
				{
					label: translator.t('contributions.new-contribution'),
					icon: <PlusIcon />,
					href: '/donate/individual',
				},
			]}
			lang={lang}
		/>
	);
};
