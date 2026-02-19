import { getAuthenticatedUserOrRedirect, requireAdmin } from '@/lib/firebase/current-user';
import { ExchangeRateService } from '@/lib/services/exchange-rate/exchange-rate.service';
import { ExchangeRatesTableViewRow } from '@/lib/services/exchange-rate/exchange-rate.types';
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

  const service = new ExchangeRateService();
  const result = await service.getTableView(user.id);

  const error = result.success ? null : result.error;
  const rows: ExchangeRatesTableViewRow[] = result.success ? result.data.tableRows : [];

  return <ExchangeRatesTable rows={rows} error={error} />;
};
