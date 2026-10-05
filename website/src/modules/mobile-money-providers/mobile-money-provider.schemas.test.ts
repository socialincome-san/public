import { mobileMoneyProviderCreateSchema, mobileMoneyProviderUpdateSchema } from './mobile-money-provider.schemas';

describe('mobile money provider schemas', () => {
	test('trims create input', () => {
		expect(
			mobileMoneyProviderCreateSchema.parse({
				name: ' Provider ',
				parentId: ' parent ',
				payoutProcess: null,
			}),
		).toEqual({
			name: 'Provider',
			parentId: 'parent',
			payoutProcess: null,
		});
	});

	test('requires an id for updates', () => {
		expect(
			mobileMoneyProviderUpdateSchema.safeParse({
				name: 'Provider',
			}).success,
		).toBe(false);
	});
});
