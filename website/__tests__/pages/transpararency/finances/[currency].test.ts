import { NextURL } from 'next/dist/server/web/next-url';
import { instance, when } from 'ts-mockito';
import { financesMiddleware } from '../../../../pages/transparency/finances/[currency]';
import { mockRequest } from '../../../__utils__/mocks';

describe('financesMiddleware should', () => {
	it('return noop for unrelated path', async () => {
		const mockedRequest = mockRequest();
		when(mockedRequest.nextUrl).thenReturn(new NextURL('/', 'https://socialincome.org'));
		const result = await financesMiddleware(instance(mockedRequest));
		expect(result).toBeUndefined();
	});

	it('it returns redirect for /transparency/finances', async () => {
		const mockedRequest = mockRequest();
		when(mockedRequest.nextUrl).thenReturn(new NextURL('/transparency/finances', 'https://socialincome.org'));
		// TODO mock different geolocations of users
		const result = await financesMiddleware(instance(mockedRequest));
		expect(result?.status).toBe(307); // redirect
		expect(result?.headers.get('Location')).toBe('https://socialincome.org/transparency/finances/chf');
	});
});
