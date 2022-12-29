import { NextURL } from 'next/dist/server/web/next-url';
import { instance, when } from 'ts-mockito';
import { financesMiddleware } from '../middleware';
import { mockRequest } from './__utils__/mocks';

describe('financesMiddleware should', () => {
	it('return noop for unrelated path', async () => {
		const mockedRequest = mockRequest();
		when(mockedRequest.nextUrl).thenReturn(new NextURL('/', 'https://socialincome.org'));
		const result = await financesMiddleware(instance(mockedRequest));
		expect(result).toBeUndefined();
	});

	it('it returns redirect to /transparency/finances/usd for undefined country', async () => {
		await testFinancesRedirect(undefined, 'usd');
	});

	it('it returns redirect to /transparency/finances/chf for CH', async () => {
		await testFinancesRedirect('CH', 'chf');
		await testFinancesRedirect('ch', 'chf');
	});

	it('it returns redirect to /transparency/finances/eur for DE', async () => {
		await testFinancesRedirect('DE', 'eur');
		await testFinancesRedirect('de', 'eur');
	});

	it('it returns redirect to /transparency/finances/usd for unknown country', async () => {
		await testFinancesRedirect('XYZ', 'usd');
		await testFinancesRedirect('xyz', 'usd');
	});
});

async function testFinancesRedirect(country: string | undefined, expectedCurrency: string) {
	const mockedRequest = mockRequest();
	when(mockedRequest.nextUrl).thenReturn(new NextURL('/transparency/finances', 'https://socialincome.org'));
	when(mockedRequest.geo).thenReturn({
		country: country,
	});
	const result = await financesMiddleware(instance(mockedRequest));
	expect(result?.status).toBe(307); // redirect
	expect(result?.headers.get('Location')).toBe('https://socialincome.org/transparency/finances/' + expectedCurrency);
}
