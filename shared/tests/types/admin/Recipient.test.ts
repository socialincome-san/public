import { describe, test } from '@jest/globals';

import { DateTime } from 'luxon';
import { calcLastPaymentDate, calcPaymentsLeft } from '../../../src/types';

describe('Recipient', () => {
	test('calc last payment', () => {
		expect(calcLastPaymentDate(new Date('2020-01-15')).toISO()).toStrictEqual(DateTime.local(2022, 12, 15).toISO());
	});

	test('calc months left', () => {
		expect(calcPaymentsLeft(DateTime.local(2022, 12, 15), DateTime.local(2020, 1, 10))).toStrictEqual(36);
		expect(calcPaymentsLeft(DateTime.local(2022, 12, 15), DateTime.local(2022, 12, 15))).toStrictEqual(0);
		expect(calcPaymentsLeft(DateTime.local(2022, 12, 15), DateTime.local(2022, 12, 10))).toStrictEqual(1);
		expect(calcPaymentsLeft(DateTime.local(2022, 12, 15), DateTime.local(2022, 12, 20))).toStrictEqual(-1);
	});
});
