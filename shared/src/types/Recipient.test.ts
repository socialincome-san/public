import { describe, test } from '@jest/globals';

import { DateTime } from 'luxon';
import { calcFinalPaymentDate, calcPaymentsLeft } from './Recipient';

describe('Recipient', () => {
	test('calc last payment', () => {
		expect(calcFinalPaymentDate(DateTime.fromObject({ year: 2020, month: 1, day: 15 })).toISO()).toStrictEqual(
			DateTime.local(2022, 12, 15).toISO(),
		);
	});

	test('calc months left', () => {
		expect(calcPaymentsLeft(DateTime.local(2022, 12, 15), DateTime.local(2020, 1, 10))).toStrictEqual(36);
		expect(calcPaymentsLeft(DateTime.local(2022, 12, 15), DateTime.local(2022, 12, 15))).toStrictEqual(0);
		expect(calcPaymentsLeft(DateTime.local(2022, 12, 15), DateTime.local(2022, 12, 10))).toStrictEqual(1);
		expect(calcPaymentsLeft(DateTime.local(2022, 12, 15), DateTime.local(2022, 12, 20))).toStrictEqual(-1);
	});
});
