import {
	clearSelection,
	emptySelection,
	getPageCheckboxState,
	getSelectedCount,
	isRowSelected,
	selectAllMatching,
	togglePage,
	toggleRow,
} from './selection';

describe('messaging-selection', () => {
	describe('emptySelection', () => {
		test('returns include mode with empty Set', () => {
			const s = emptySelection();
			expect(s.mode).toBe('include');
			if (s.mode === 'include') {
				expect(s.ids.size).toBe(0);
			}
		});
	});

	describe('toggleRow', () => {
		test('include mode: adds id when absent', () => {
			const s = toggleRow(emptySelection(), 'r1');
			expect(s.mode).toBe('include');
			if (s.mode === 'include') {
				expect(s.ids.has('r1')).toBe(true);
			}
		});

		test('include mode: removes id when present', () => {
			const s = toggleRow(toggleRow(emptySelection(), 'r1'), 'r1');
			if (s.mode === 'include') {
				expect(s.ids.has('r1')).toBe(false);
			}
		});

		test('all-matching mode: adds id to excludedIds when not excluded', () => {
			const initial = { mode: 'all-matching' as const, search: 'a', excludedIds: new Set<string>() };
			const s = toggleRow(initial, 'r1');
			if (s.mode === 'all-matching') {
				expect(s.excludedIds.has('r1')).toBe(true);
			}
		});

		test('all-matching mode: removes id from excludedIds when excluded', () => {
			const initial = { mode: 'all-matching' as const, search: 'a', excludedIds: new Set(['r1']) };
			const s = toggleRow(initial, 'r1');
			if (s.mode === 'all-matching') {
				expect(s.excludedIds.has('r1')).toBe(false);
			}
		});
	});

	describe('togglePage', () => {
		test('include mode, page not fully selected: adds all page ids', () => {
			const s = togglePage(emptySelection(), ['a', 'b', 'c']);
			if (s.mode === 'include') {
				expect(s.ids.has('a')).toBe(true);
				expect(s.ids.has('b')).toBe(true);
				expect(s.ids.has('c')).toBe(true);
			}
		});

		test('include mode, page fully selected: removes all page ids', () => {
			const start = togglePage(emptySelection(), ['a', 'b', 'c']);
			const s = togglePage(start, ['a', 'b', 'c']);
			if (s.mode === 'include') {
				expect(s.ids.size).toBe(0);
			}
		});

		test('all-matching mode, page fully selected: adds all page ids to excludedIds', () => {
			const initial = { mode: 'all-matching' as const, search: 'q', excludedIds: new Set<string>() };
			const s = togglePage(initial, ['a', 'b']);
			if (s.mode === 'all-matching') {
				expect(s.excludedIds.has('a')).toBe(true);
				expect(s.excludedIds.has('b')).toBe(true);
			}
		});

		test('all-matching mode, page partially excluded: removes excluded ids (selecting them back)', () => {
			const initial = { mode: 'all-matching' as const, search: 'q', excludedIds: new Set(['a']) };
			const s = togglePage(initial, ['a', 'b']);
			if (s.mode === 'all-matching') {
				expect(s.excludedIds.has('a')).toBe(false);
				expect(s.excludedIds.has('b')).toBe(false);
			}
		});
	});

	describe('selectAllMatching', () => {
		test('switches to all-matching with snapshotted search and empty excludedIds', () => {
			const s = selectAllMatching(toggleRow(emptySelection(), 'r1'), 'hello');
			expect(s.mode).toBe('all-matching');
			if (s.mode === 'all-matching') {
				expect(s.search).toBe('hello');
				expect(s.excludedIds.size).toBe(0);
			}
		});
	});

	describe('clearSelection', () => {
		test('resets to empty include from include mode', () => {
			const s = clearSelection(toggleRow(emptySelection(), 'r1'));
			expect(s.mode).toBe('include');
			if (s.mode === 'include') {
				expect(s.ids.size).toBe(0);
			}
		});

		test('resets to empty include from all-matching mode', () => {
			const initial = { mode: 'all-matching' as const, search: 'q', excludedIds: new Set(['r1']) };
			const s = clearSelection(initial);
			expect(s.mode).toBe('include');
			if (s.mode === 'include') {
				expect(s.ids.size).toBe(0);
			}
		});
	});

	describe('isRowSelected', () => {
		test('include mode: true iff id is in ids', () => {
			const s = toggleRow(emptySelection(), 'r1');
			expect(isRowSelected(s, 'r1')).toBe(true);
			expect(isRowSelected(s, 'r2')).toBe(false);
		});

		test('all-matching mode: true iff id is NOT in excludedIds', () => {
			const s = { mode: 'all-matching' as const, search: 'q', excludedIds: new Set(['r1']) };
			expect(isRowSelected(s, 'r1')).toBe(false);
			expect(isRowSelected(s, 'r2')).toBe(true);
		});
	});

	describe('getSelectedCount', () => {
		test('include mode: returns ids.size, totalCount ignored', () => {
			const s = togglePage(emptySelection(), ['a', 'b', 'c']);
			expect(getSelectedCount(s, 999)).toBe(3);
		});

		test('all-matching mode: returns totalCount - excludedIds.size', () => {
			const s = { mode: 'all-matching' as const, search: 'q', excludedIds: new Set(['a', 'b']) };
			expect(getSelectedCount(s, 247)).toBe(245);
		});

		test('all-matching mode: never returns negative when totalCount drifts below excludedIds.size', () => {
			const s = { mode: 'all-matching' as const, search: 'q', excludedIds: new Set(['a', 'b', 'c']) };
			expect(getSelectedCount(s, 1)).toBe(0);
		});
	});

	describe('getPageCheckboxState', () => {
		test("'none' when no row on page is selected", () => {
			expect(getPageCheckboxState(emptySelection(), ['a', 'b', 'c'])).toBe('none');
		});

		test("'all' when every row on page is selected", () => {
			const s = togglePage(emptySelection(), ['a', 'b', 'c']);
			expect(getPageCheckboxState(s, ['a', 'b', 'c'])).toBe('all');
		});

		test("'some' when at least one but not all rows are selected", () => {
			const s = toggleRow(emptySelection(), 'b');
			expect(getPageCheckboxState(s, ['a', 'b', 'c'])).toBe('some');
		});

		test("'none' when page is empty", () => {
			expect(getPageCheckboxState(emptySelection(), [])).toBe('none');
		});
	});
});
