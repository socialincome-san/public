import { applyTableQueryPatch, tableQueryFromSearchParams } from './query-state';

describe('recipient audit filter query state', () => {
	test('reads the audit filters from URL search params', () => {
		expect(
			tableQueryFromSearchParams({
				paymentPhone: '+232200',
				contactPhone: '+232100',
				firstName: 'Ada',
				lastName: 'King',
			}),
		).toMatchObject({
			paymentPhone: '+232200',
			contactPhone: '+232100',
			firstName: 'Ada',
			lastName: 'King',
		});
	});

	test('updates and clears filters without changing the other filter values', () => {
		const searchParams = new URLSearchParams(
			'paymentPhone=%2B232200&contactPhone=%2B232100&firstName=Ada&lastName=King&search=Augusta',
		);

		const nextParams = applyTableQueryPatch(searchParams, { paymentPhone: undefined, firstName: 'Augusta' });

		expect(nextParams.get('paymentPhone')).toBeNull();
		expect(nextParams.get('contactPhone')).toBe('+232100');
		expect(nextParams.get('firstName')).toBe('Augusta');
		expect(nextParams.get('lastName')).toBe('King');
		expect(nextParams.get('search')).toBe('Augusta');
	});
});
