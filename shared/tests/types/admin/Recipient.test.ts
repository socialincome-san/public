import { describe, test } from '@jest/globals';
import { calcLastPaymentDate, calcPaymentsLeft } from '../../../src/types';

describe('Recipient', () => {
	test('calc last payment', async () => {
		expect(calcLastPaymentDate(new Date('2020-01-15'))).toStrictEqual(new Date('2022-12-15'));
	});

	test('calc months left', () => {
		expect(calcPaymentsLeft(new Date('2022-12-15'), new Date('2020-01-10'))).toStrictEqual(36);
		expect(calcPaymentsLeft(new Date('2022-12-15'), new Date('2022-12-15'))).toStrictEqual(0);
		expect(calcPaymentsLeft(new Date('2022-12-15'), new Date('2022-12-10'))).toStrictEqual(1);
		expect(calcPaymentsLeft(new Date('2022-12-15'), new Date('2022-12-20'))).toStrictEqual(-1);
	});
});
