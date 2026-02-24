import { getAuthenticatedUserOrRedirect, requireAdmin } from '@/lib/firebase/current-user';
import { ExchangeRatesTableViewRow } from '@/lib/services/exchange-rate/exchange-rate.types';
import { services } from '@/lib/services/services';
import { Suspense } from 'react';
import ExchangeRatesTable from './exchange-rates-table';

export default function ExchangeRatesPage() {
	return (
		<Suspense>
			<ExchangeRatesDataLoader />
		</Suspense>
	);
}

const ExchangeRatesDataLoader = async () => {
	const user = await getAuthenticatedUserOrRedirect();
	await requireAdmin(user);

	const service = services.exchangeRate;
	const result = await service.getTableView(user.id);

	const error = result.success ? null : result.error;
	const rows: ExchangeRatesTableViewRow[] = result.success ? result.data.tableRows : [];

	return <ExchangeRatesTable rows={rows} error={error} />;
};
