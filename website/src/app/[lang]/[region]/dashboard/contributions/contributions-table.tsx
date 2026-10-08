import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { getYourContributionsTableConfig } from '@/components/data-table/configs/your-contributions-table.config';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getPaginatedYourContributionsTableView } from '@/modules/contributions/contribution.service';
import { YourContributionsTableViewRow } from '@/modules/contributions/contribution.types';
import { requireSession } from '@/server/session';
import { getTranslations } from 'next-intl/server';

export const ContributionsTable = async ({
	lang,
	region,
	searchParams,
}: {
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	searchParams: Promise<Record<string, string>>;
}) => {
	const contributor = await requireSession('contributor');
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const t = await getTranslations('website-me');
	const config = getYourContributionsTableConfig({
		title: t('sections.contributions.payments'),
		emptyMessage: t('contributions.no-contributions'),
	});

	const result = await getPaginatedYourContributionsTableView(contributor.id, tableQuery);

	const error = result.success ? null : result.error;
	const rows: YourContributionsTableViewRow[] = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;

	return (
		<ConfiguredDataTableClient
			config={config}
			titleInfoTooltip="Shows your contribution history."
			rows={rows}
			error={error}
			query={{ ...tableQuery, totalRows }}
			actionMenuItems={[
				{
					label: t('donate-now'),
					href: `/${lang}/${region}`,
				},
			]}
		/>
	);
};
