import { setChosenCountryAction } from './visitor-country.actions';

const cookieStore = { set: jest.fn(), delete: jest.fn() };

jest.mock('next/headers', () => ({ cookies: () => Promise.resolve(cookieStore) }));

describe('setChosenCountryAction', () => {
	beforeEach(() => jest.clearAllMocks());

	test('stores a valid country', async () => {
		expect(await setChosenCountryAction('DE')).toEqual({ success: true, data: true });
		expect(cookieStore.set).toHaveBeenCalledWith(expect.objectContaining({ name: 'si_country', value: 'DE' }));
	});

	test('clears the cookie to go back to the geo-IP country', async () => {
		expect(await setChosenCountryAction(null)).toEqual({ success: true, data: true });
		expect(cookieStore.delete).toHaveBeenCalledWith('si_country');
	});

	test('rejects unknown countries', async () => {
		expect((await setChosenCountryAction('XX')).success).toBe(false);
		expect(cookieStore.set).not.toHaveBeenCalled();
	});
});
