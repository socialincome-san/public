import { Timestamp } from '@google-cloud/firestore';
import { ExchangeRates, Payment, PaymentStatus } from '@socialincome/shared/src/types';
import { BatchAddCHFToPayments } from './BatchAddCHFToPayments';

describe('BatchAddCHFToPayments', () => {
	test('calcAmountChf', async () => {
		const exchangeRates: Map<number, ExchangeRates> = new Map([
			[
				1682640000, // 2023-04-28 00:00:00
				{ SLE: 25.0, SLL: 25000 },
			],
		]);
		const paymentSLL: Payment = {
			amount: 500000,
			currency: 'SLL',
			payment_at: Timestamp.fromMillis(1682672487 * 1000), // 2023-04-28 09:01:00
			status: PaymentStatus.Confirmed,
		};

		const paymentSLE: Payment = {
			amount: 500,
			currency: 'SLE',
			payment_at: Timestamp.fromMillis(1682672487 * 1000), // 2023-04-28 09:01:00
			status: PaymentStatus.Confirmed,
		};

		// exact currency match case
		expect(BatchAddCHFToPayments.calcAmountChf(exchangeRates, paymentSLL)).toBe(20);
		expect(BatchAddCHFToPayments.calcAmountChf(exchangeRates, paymentSLE)).toBe(20);

		// fallback from SLE to SLL exchange rate
		const exchangeRatesWithoutSLE: Map<number, ExchangeRates> = new Map([
			[
				1682640000, // 2023-04-28 00:00:00
				{ SLL: 25000 },
			],
		]);
		expect(BatchAddCHFToPayments.calcAmountChf(exchangeRatesWithoutSLE, paymentSLE)).toBe(20);

		// currencies not available
		const exchangeRatesWithoutSLEAndSLL: Map<number, ExchangeRates> = new Map([
			[
				1682640000, // 2023-04-28 00:00:00
				{ XYZ: 25000 },
			],
		]);
		expect(BatchAddCHFToPayments.calcAmountChf(exchangeRatesWithoutSLEAndSLL, paymentSLE)).toBe(null);

		// day not available
		const exchangeRatesOtherDate: Map<number, ExchangeRates> = new Map([
			[
				1682553600, // 2023-04-27 00:00:00
				{ SLE: 25.0, SLL: 25000 },
			],
		]);
		expect(BatchAddCHFToPayments.calcAmountChf(exchangeRatesOtherDate, paymentSLE)).toBe(null);
		expect(BatchAddCHFToPayments.calcAmountChf(exchangeRatesOtherDate, paymentSLL)).toBe(null);
	});
});
