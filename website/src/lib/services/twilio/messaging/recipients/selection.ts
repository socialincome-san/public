import type { MessagingRecipientFilters } from './recipients.types';
import type { PageCheckboxState, SelectionState } from './selection.types';

export const emptySelection = (): SelectionState => ({ mode: 'include', ids: new Set() });

export const toggleRow = (state: SelectionState, id: string): SelectionState => {
	if (state.mode === 'include') {
		const ids = new Set(state.ids);
		if (ids.has(id)) {
			ids.delete(id);
		} else {
			ids.add(id);
		}

		return { mode: 'include', ids };
	}

	const excludedIds = new Set(state.excludedIds);
	if (excludedIds.has(id)) {
		excludedIds.delete(id);
	} else {
		excludedIds.add(id);
	}

	return { mode: 'all-matching', search: state.search, filters: state.filters, excludedIds };
};

export const togglePage = (state: SelectionState, pageIds: string[]): SelectionState => {
	if (pageIds.length === 0) {
		return state;
	}
	const allSelected = pageIds.every((id) => isRowSelected(state, id));

	if (state.mode === 'include') {
		const ids = new Set(state.ids);
		if (allSelected) {
			pageIds.forEach((id) => ids.delete(id));
		} else {
			pageIds.forEach((id) => ids.add(id));
		}

		return { mode: 'include', ids };
	}

	const excludedIds = new Set(state.excludedIds);
	if (allSelected) {
		pageIds.forEach((id) => excludedIds.add(id));
	} else {
		pageIds.forEach((id) => excludedIds.delete(id));
	}

	return { mode: 'all-matching', search: state.search, filters: state.filters, excludedIds };
};

export const selectAllMatching = (
	_state: SelectionState,
	search: string,
	filters: MessagingRecipientFilters,
): SelectionState => ({
	mode: 'all-matching',
	search,
	filters,
	excludedIds: new Set(),
});

export const clearSelection = (): SelectionState => emptySelection();

export const isRowSelected = (state: SelectionState, id: string): boolean => {
	if (state.mode === 'include') {
		return state.ids.has(id);
	}

	return !state.excludedIds.has(id);
};

export const getSelectedCount = (state: SelectionState, totalCount: number): number => {
	if (state.mode === 'include') {
		return state.ids.size;
	}

	return Math.max(0, totalCount - state.excludedIds.size);
};

export const getPageCheckboxState = (state: SelectionState, pageIds: string[]): PageCheckboxState => {
	if (pageIds.length === 0) {
		return 'none';
	}
	let selectedOnPage = 0;
	for (const id of pageIds) {
		if (isRowSelected(state, id)) {
			selectedOnPage++;
		}
	}
	if (selectedOnPage === 0) {
		return 'none';
	}
	if (selectedOnPage === pageIds.length) {
		return 'all';
	}

	return 'some';
};
