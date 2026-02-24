import { getAuthenticatedUserOrRedirect, requireAdmin } from '@/lib/firebase/current-user';
import type { CountryTableViewRow } from '@/lib/services/country/country.types';
import { services } from '@/lib/services/services';
import { Suspense } from 'react';
import CountriesTable from './countries-table';

export default function CountriesPage() {
	return (
		<Suspense>
			<CountriesDataLoader />
		</Suspense>
	);
}

const CountriesDataLoader = async () => {
	const user = await getAuthenticatedUserOrRedirect();
	await requireAdmin(user);

	const service = services.country;
	const result = await service.getTableView(user.id);

	const error = result.success ? null : result.error;
	const rows: CountryTableViewRow[] = result.success ? result.data.tableRows : [];

	return <CountriesTable rows={rows} error={error} />;
};
