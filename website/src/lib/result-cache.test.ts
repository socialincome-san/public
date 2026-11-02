import { cacheLife } from 'next/cache';
import { resultFail, resultOk } from './result';
import { cacheResult } from './result-cache';

jest.mock('next/cache', () => ({ cacheLife: jest.fn() }));

beforeEach(() => jest.resetAllMocks());

test('keeps the default success profile for existing callers', async () => {
	const result = resultOk('data');
	await expect(cacheResult(Promise.resolve(result))).resolves.toBe(result);
	expect(cacheLife).toHaveBeenCalledWith('default');
	expect(cacheLife).toHaveBeenCalledTimes(1);
});

test('uses the requested success profile', async () => {
	const result = resultOk([]);
	await expect(cacheResult(Promise.resolve(result), 'days')).resolves.toBe(result);
	expect(cacheLife).toHaveBeenCalledWith('days');
	expect(cacheLife).toHaveBeenCalledTimes(1);
});

test.each([undefined, 'days'] as const)('caches failures only for minutes with success profile %s', async (profile) => {
	const result = resultFail('Unavailable.', 503);
	await expect(cacheResult(Promise.resolve(result), profile)).resolves.toBe(result);
	expect(cacheLife).toHaveBeenCalledWith('minutes');
	expect(cacheLife).toHaveBeenCalledTimes(1);
});

test.each(['default', 'days'] as const)('continues treating 404 as an answer with profile %s', async (profile) => {
	const result = resultFail('Not found.', 404);
	await expect(cacheResult(Promise.resolve(result), profile)).resolves.toBe(result);
	expect(cacheLife).toHaveBeenCalledWith(profile);
	expect(cacheLife).toHaveBeenCalledTimes(1);
});
