import {
	emptySelection,
	getPageCheckboxState,
	getSelectedCount,
	isRowSelected,
	selectAllMatching,
	togglePage,
	toggleRow,
} from './selection';

describe('messaging selection', () => {
	test('toggles individual and page selections in include mode', () => {
		const single = toggleRow(emptySelection(), 'a');
		expect(isRowSelected(single, 'a')).toBe(true);
		expect(getPageCheckboxState(single, ['a', 'b'])).toBe('some');

		const page = togglePage(single, ['a', 'b']);
		expect(getPageCheckboxState(page, ['a', 'b'])).toBe('all');
		expect(getSelectedCount(page, 10)).toBe(2);
	});

	test('all-matching snapshots filters and excludes deselected rows', () => {
		const selected = selectAllMatching(emptySelection(), 'ada', { programId: 'p1' });
		const excluded = toggleRow(selected, 'r2');

		expect(isRowSelected(excluded, 'r1')).toBe(true);
		expect(isRowSelected(excluded, 'r2')).toBe(false);
		expect(getSelectedCount(excluded, 5)).toBe(4);
		expect(excluded).toMatchObject({ search: 'ada', filters: { programId: 'p1' } });
	});
});
