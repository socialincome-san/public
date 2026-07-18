import { resolveSelectionToIds, type RowFetcher } from './resolve-selection';
import type { SelectionState } from './selection.types';

describe('resolveSelectionToIds', () => {
	test('include mode returns the included ids in deterministic order', async () => {
		const selection: SelectionState = { mode: 'include', ids: new Set(['c', 'a', 'b']) };
		const fetcher: RowFetcher = jest.fn();
		const ids = await resolveSelectionToIds(selection, fetcher);
		expect(ids.sort()).toEqual(['a', 'b', 'c']);
		expect(fetcher).not.toHaveBeenCalled();
	});

	test('all-matching mode paginates and excludes, forwarding search and filters to the fetcher', async () => {
		const filters = { programId: 'p1', recipientStatus: 'active' };
		const selection: SelectionState = { mode: 'all-matching', search: 'foo', filters, excludedIds: new Set(['b']) };
		const fetcher: jest.Mock<ReturnType<RowFetcher>, Parameters<RowFetcher>> = jest.fn(
			(page, pageSize, search, appliedFilters) => {
				void pageSize;
				void search;
				void appliedFilters;
				if (page === 1) {
					return Promise.resolve({ ids: ['a', 'b'], totalCount: 3 });
				}
				if (page === 2) {
					return Promise.resolve({ ids: ['c'], totalCount: 3 });
				}
				throw new Error('unexpected page');
			},
		);
		const ids = await resolveSelectionToIds(selection, fetcher, 2);
		expect(ids).toEqual(['a', 'c']);
		expect(fetcher).toHaveBeenCalledTimes(2);
		expect(fetcher).toHaveBeenNthCalledWith(1, 1, 2, 'foo', filters);
		expect(fetcher).toHaveBeenNthCalledWith(2, 2, 2, 'foo', filters);
	});

	test('all-matching mode stops when total reached', async () => {
		const selection: SelectionState = { mode: 'all-matching', search: '', filters: {}, excludedIds: new Set() };
		const fetcher = jest.fn(() => Promise.resolve({ ids: ['a', 'b'], totalCount: 2 }));
		const ids = await resolveSelectionToIds(selection, fetcher, 2);
		expect(ids).toEqual(['a', 'b']);
		expect(fetcher).toHaveBeenCalledTimes(1);
	});
});
