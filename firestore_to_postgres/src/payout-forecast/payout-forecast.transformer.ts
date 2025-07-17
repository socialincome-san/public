import { CreatePayoutForecastInput } from '@socialincome/shared/src/database/services/payout-forecast/payout-forecast.types';
import { PaymentForecastEntry } from '@socialincome/shared/src/types/payment-forecast';
import { BaseTransformer } from '../core/base.transformer';

export class PayoutForecastTransformer extends BaseTransformer<PaymentForecastEntry, CreatePayoutForecastInput> {
	transform = async (input: PaymentForecastEntry[]): Promise<CreatePayoutForecastInput[]> => {
		return input.map((entry): CreatePayoutForecastInput => {
			return {
				order: entry.order,
				month: this.parseMonth(entry.month),
				numberOfRecipients: entry.numberOfRecipients,
				amountUsd: entry.amount_usd,
				amountSle: entry.amount_sle,
			};
		});
	};

	private parseMonth(monthStr: string): Date {
		const monthMap: Record<string, number> = {
			January: 0,
			February: 1,
			March: 2,
			April: 3,
			May: 4,
			June: 5,
			July: 6,
			August: 7,
			September: 8,
			October: 9,
			November: 10,
			December: 11,
		};

		const [monthName, yearStr] = monthStr.split(' ');
		const month = monthMap[monthName];
		const year = parseInt(yearStr, 10);

		if (isNaN(month) || isNaN(year)) {
			throw new Error(`Invalid month format: ${monthStr}`);
		}

		return new Date(Date.UTC(year, month, 1));
	}
}
