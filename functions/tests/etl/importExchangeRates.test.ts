import { describe, expect, test } from '@jest/globals';
import firebaseFunctionsTest from 'firebase-functions-test';
import { doc } from '../../../shared/src/firebase/firestoreAdmin';
import { ExchangeRates, ExchangeRatesEntry, EXCHANGE_RATES_PATH } from '../../../shared/src/types';
import { ExchangeRateResponse, storeExchangeRates } from '../../src/etl/importExchangeRates';
const { cleanup } = firebaseFunctionsTest();

describe('importExchangeRates', () => {
	afterAll(() => cleanup());

	test('inserts exchange rates into firestore', async () => {
		const rawResponse: ExchangeRateResponse = {
			base: 'CHF',
			date: '2022-12-20',
			rates: { AED: 3.9, AFN: 94.03 },
		};

		const exchangeRates: ExchangeRatesEntry = {
			base: 'CHF',
			timestamp: 1671494400,
			rates: { AED: 3.9, AFN: 94.03 },
		};

		await storeExchangeRates(rawResponse);

		const snap = await doc<ExchangeRates>(EXCHANGE_RATES_PATH, '1671494400').get();
		expect(exchangeRates).toEqual(snap.data());
	});
	jest.setTimeout(30000);
});
