import { NextRequest } from 'next/server';
import { mock } from 'ts-mockito';

export const mockRequest = () => {
	const mockedRequest: NextRequest = mock(NextRequest);
	(Headers.prototype as any).getAll = () => []; // mock getAll, bugfix for https://github.com/vercel/next.js/issues/42374
	return mockedRequest;
};
