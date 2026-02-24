import { Button } from '@/components/button';
import { makeYourContributionsColumns } from '@/components/data-table/columns/your-contributions';
import DataTable from '@/components/data-table/data-table';
import { getAuthenticatedContributorOrRedirect } from '@/lib/firebase/current-contributor';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { YourContributionsTableViewRow } from '@/lib/services/contribution/contribution.types';
import { services } from '@/lib/services/services';
import Link from 'next/link';

export const ContributionsTable = async ({ lang }: { lang: WebsiteLanguage }) => {
	const contributor = await getAuthenticatedContributorOrRedirect();

	const translator = await Translator.getInstance({ language: lang as WebsiteLanguage, namespaces: ['website-me'] });

	const service = services.contribution;
	const result = await service.getYourContributionsTableView(contributor.id);

	const error = result.success ? null : result.error;
	const rows: YourContributionsTableViewRow[] = result.success ? result.data.tableRows : [];

	return (
		<DataTable
			title={translator.t('sections.contributions.payments')}
			error={error}
			emptyMessage={translator.t('contributions.no-contributions')}
			data={rows}
			actions={
				<Link href="/donate/individual">
					<Button>{translator.t('contributions.new-contribution')}</Button>
				</Link>
			}
			makeColumns={makeYourContributionsColumns}
			lang={lang}
		/>
	);
};
