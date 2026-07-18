import type { SelectionState } from './recipients.types';
import { resolveSelectionToIds, type RowFetcher } from './resolve-selection';

describe('resolveSelectionToIds', () => {
	test('include mode returns the included ids in deterministic order', async () => {
		const selection: SelectionState = { mode: 'include', ids: new Set(['c', 'a', 'b']) };
		const fetcher: RowFetcher = jest.fn();
		const ids = await resolveSelectionToIds(selection, fetcher);
		expect(ids.sort()).toEqual(['a', 'b', 'c']);
		expect(fetcher).not.toHaveBeenCalled();
	});

	test('all-matching mode paginates and excludes', async () => {
		const selection: SelectionState = { mode: 'all-matching', search: 'foo', excludedIds: new Set(['b']) };
		const fetcher: jest.Mock<ReturnType<RowFetcher>, Parameters<RowFetcher>> = jest.fn(async (page, _pageSize, _search) => {
			if (page === 1) {
				return { ids: ['a', 'b'], totalCount: 3 };
			}
			if (page === 2) {
				return { ids: ['c'], totalCount: 3 };
			}
			throw new Error('unexpected page');
		});
		const ids = await resolveSelectionToIds(selection, fetcher, 2);
		expect(ids).toEqual(['a', 'c']);
		expect(fetcher).toHaveBeenCalledTimes(2);
		expect(fetcher).toHaveBeenNthCalledWith(1, 1, 2, 'foo');
		expect(fetcher).toHaveBeenNthCalledWith(2, 2, 2, 'foo');
	});

	test('all-matching mode stops when total reached', async () => {
		const selection: SelectionState = { mode: 'all-matching', search: '', excludedIds: new Set() };
		const fetcher = jest.fn(async () => ({ ids: ['a', 'b'], totalCount: 2 }));
		const ids = await resolveSelectionToIds(selection, fetcher, 2);
		expect(ids).toEqual(['a', 'b']);
		expect(fetcher).toHaveBeenCalledTimes(1);
	});
});
