import { beforeEach, describe, expect, test } from '@jest/globals';
import { getOrInitializeApp } from '@socialincome/shared/src/firebase/app';
import { FirestoreAdmin } from '@socialincome/shared/src/firebase/FirestoreAdmin';
import { ExchangeRates, ExchangeRatesEntry, EXCHANGE_RATES_PATH } from '@socialincome/shared/src/types';
import functions from 'firebase-functions-test';
import { ExchangeRateImporter, ExchangeRateResponse } from './ExchangeRateImporter';

describe('importExchangeRates', () => {
	const projectId = 'test' + new Date().getTime();
	const testEnv = functions({ projectId: projectId });
	const firestoreAdmin = new FirestoreAdmin(getOrInitializeApp({ projectId: projectId }));
	const exchangeRateImporter = new ExchangeRateImporter();

	beforeEach(async () => {
		await testEnv.firestore.clearFirestoreData({ projectId: projectId });
	});

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

		await exchangeRateImporter.storeExchangeRates(rawResponse);

		const snap = await firestoreAdmin.doc<ExchangeRates>(EXCHANGE_RATES_PATH, '1671494400').get();
		expect(exchangeRates).toEqual(snap.data());
	});
	jest.setTimeout(30000);
});
