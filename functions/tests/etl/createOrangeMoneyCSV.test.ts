import { afterEach, describe, test } from '@jest/globals';
import { Recipient } from '@socialincome/shared/src/types';
import firebaseFunctionsTest from 'firebase-functions-test';
import { createRecipientsCSV } from '../../src/etl/createOrangeMoneyCSV';
const { cleanup } = firebaseFunctionsTest();

describe('createOrangeMoneyCSV', () => {
	afterEach(() => cleanup());

	test('createOrangeMoneyCSV test', async () => {
		const csv = createRecipientsCSV(testRecipients as Recipient[], new Date(2022, 11, 1, 0));
		expect(csv).toEqual(expectedCSV);
	});

	const testRecipients: Partial<Recipient>[] = [
		// Recipient 1
		{
			mobile_money_phone: {
				phone: 23200000001,
				has_whatsapp: false,
			},
			om_uid: 1,
			first_name: 'John',
			last_name: 'Doe',
			progr_status: 'active',
		},
		// Recipient 2
		{
			mobile_money_phone: {
				phone: 23200000002,
				has_whatsapp: false,
			},
			om_uid: 2,
			first_name: 'Bin',
			last_name: 'Bun',
			progr_status: 'designated',
		},
		// Recipient 3 (ignored -> waitlisted)
		{
			mobile_money_phone: {
				phone: 23200000003,
				has_whatsapp: false,
			},
			om_uid: 3,
			first_name: 'Marc',
			last_name: 'Mun',
			progr_status: 'waitlisted',
		},
	];

	const expectedCSV = `
Mobile Number*,Amount*,First Name,Last Name,Id Number,Remarks*,User Type*
00000001,400,John,Doe,1,Social Income December 2022,subscriber
00000002,400,Bin,Bun,2,Social Income December 2022,subscriber
`.trim();
});
