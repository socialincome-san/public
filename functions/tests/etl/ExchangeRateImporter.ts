import { beforeEach, describe, expect, test } from '@jest/globals';
import * as admin from 'firebase-admin';
import functions from 'firebase-functions-test';
import { FirestoreAdmin } from '../../../shared/src/firebase/firestoreAdmin';
import { ExchangeRates, ExchangeRatesEntry, EXCHANGE_RATES_PATH } from '../../../shared/src/types';
import { ExchangeRateImporter, ExchangeRateResponse } from '../../src/etl/ExchangeRateImporter';

describe('importExchangeRates', () => {
	const projectId = 'test' + new Date().getTime();
	const testEnv = functions({ projectId: projectId });
	const firestoreAdmin = new FirestoreAdmin(admin.initializeApp({ projectId: projectId }));
	const exchangeRateImporter = new ExchangeRateImporter(firestoreAdmin);
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
