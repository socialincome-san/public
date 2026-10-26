import { getVisitorCountryAction, setChosenCountryAction } from './visitor-country.actions';

const cookieStore = { get: jest.fn(), set: jest.fn(), delete: jest.fn() };
const requestHeaders = new Headers();

jest.mock('next/headers', () => ({
	cookies: () => Promise.resolve(cookieStore),
	headers: () => Promise.resolve(requestHeaders),
}));

describe('setChosenCountryAction', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		requestHeaders.delete('x-vercel-ip-country');
		cookieStore.get.mockReturnValue(undefined);
	});

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

describe('getVisitorCountryAction', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		requestHeaders.delete('x-vercel-ip-country');
		cookieStore.get.mockReturnValue(undefined);
	});

	test('returns the country from the visitor geo-IP header', async () => {
		requestHeaders.set('x-vercel-ip-country', 'DE');

		expect(await getVisitorCountryAction()).toEqual({ success: true, data: 'DE' });
	});

	test('prefers the visitor country selected in the cookie', async () => {
		requestHeaders.set('x-vercel-ip-country', 'DE');
		cookieStore.get.mockReturnValue({ value: 'FR' });

		expect(await getVisitorCountryAction()).toEqual({ success: true, data: 'FR' });
	});

	test('returns null when the country is unavailable or unsupported', async () => {
		requestHeaders.set('x-vercel-ip-country', 'XX');

		expect(await getVisitorCountryAction()).toEqual({ success: true, data: null });
	});
});
