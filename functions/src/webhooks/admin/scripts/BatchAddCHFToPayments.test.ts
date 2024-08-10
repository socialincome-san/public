import { DateTime } from 'luxon';
import { toFirebaseAdminTimestamp } from '../../../../../shared/src/firebase/admin/utils';
import { ExchangeRates } from '../../../../../shared/src/types/exchange-rates';
import { Payment, PaymentStatus } from '../../../../../shared/src/types/payment';
import { PaymentsManager } from './PaymentsManager';

test('BatchAddCHFToPayments', async () => {
	const exchangeRates: Map<number, ExchangeRates> = new Map([
		[
			1682640000, // 2023-04-28 00:00:00
			{ SLE: 25.0, SLL: 25000 },
		],
	]);
	const paymentSLL: Payment = {
		amount: 500000,
		currency: 'SLL',
		payment_at: toFirebaseAdminTimestamp(DateTime.fromSeconds(1682672487)), // 2023-04-28 09:01:00
		status: PaymentStatus.Confirmed,
	};

	const paymentSLE: Payment = {
		amount: 500,
		currency: 'SLE',
		payment_at: toFirebaseAdminTimestamp(DateTime.fromSeconds(1682672487)), // 2023-04-28 09:01:00
		status: PaymentStatus.Confirmed,
	};

	// exact currency match case
	expect(PaymentsManager.calcAmountChf(exchangeRates, paymentSLL)).toBe(20);
	expect(PaymentsManager.calcAmountChf(exchangeRates, paymentSLE)).toBe(20);

	// fallback from SLE to SLL exchange rate
	const exchangeRatesWithoutSLE: Map<number, ExchangeRates> = new Map([
		[
			1682640000, // 2023-04-28 00:00:00
			{ SLL: 25000 },
		],
	]);
	expect(PaymentsManager.calcAmountChf(exchangeRatesWithoutSLE, paymentSLE)).toBe(20);

	// currencies not available
	const exchangeRatesWithoutSLEAndSLL: Map<number, ExchangeRates> = new Map([
		[
			1682640000, // 2023-04-28 00:00:00
			{ BTC: 25000 },
		],
	]);
	expect(PaymentsManager.calcAmountChf(exchangeRatesWithoutSLEAndSLL, paymentSLE)).toBe(null);

	// day not available
	const exchangeRatesOtherDate: Map<number, ExchangeRates> = new Map([
		[
			1682553600, // 2023-04-27 00:00:00
			{ SLE: 25.0, SLL: 25000 },
		],
	]);
	expect(PaymentsManager.calcAmountChf(exchangeRatesOtherDate, paymentSLE)).toBe(null);
	expect(PaymentsManager.calcAmountChf(exchangeRatesOtherDate, paymentSLL)).toBe(null);
});
