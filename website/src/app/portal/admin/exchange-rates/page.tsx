import { getAuthenticatedUserOrRedirect, requireAdmin } from '@/lib/firebase/current-user';
import { ExchangeRateService } from '@socialincome/shared/src/database/services/exchange-rate/exchange-rate.service';
import { ExchangeRatesTableViewRow } from '@socialincome/shared/src/database/services/exchange-rate/exchange-rate.types';
import ExchangeRatesTable from './exchange-rates-table';

export default async function ExchangeRatesPage() {
	const user = await getAuthenticatedUserOrRedirect();
	await requireAdmin(user);

	const service = new ExchangeRateService();
	const result = await service.getTableView(user.id);

	const error = result.success ? null : result.error;
	const rows: ExchangeRatesTableViewRow[] = result.success ? result.data.tableRows : [];

	return <ExchangeRatesTable rows={rows} error={error} />;
}
