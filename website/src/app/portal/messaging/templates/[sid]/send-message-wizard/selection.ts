import type { MessagingRecipientFilters, PageCheckboxState, SelectionState } from '@/modules/messaging/messaging.types';

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

	return { ...state, excludedIds };
};

export const togglePage = (state: SelectionState, pageIds: string[]): SelectionState => {
	if (pageIds.length === 0) {
		return state;
	}
	const allSelected = pageIds.every((id) => isRowSelected(state, id));
	if (state.mode === 'include') {
		const ids = new Set(state.ids);
		for (const id of pageIds) {
			if (allSelected) {
				ids.delete(id);
			} else {
				ids.add(id);
			}
		}

		return { mode: 'include', ids };
	}

	const excludedIds = new Set(state.excludedIds);
	for (const id of pageIds) {
		if (allSelected) {
			excludedIds.add(id);
		} else {
			excludedIds.delete(id);
		}
	}

	return { ...state, excludedIds };
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

export const isRowSelected = (state: SelectionState, id: string): boolean =>
	state.mode === 'include' ? state.ids.has(id) : !state.excludedIds.has(id);

export const getSelectedCount = (state: SelectionState, totalCount: number): number =>
	state.mode === 'include' ? state.ids.size : Math.max(0, totalCount - state.excludedIds.size);

export const getPageCheckboxState = (state: SelectionState, pageIds: string[]): PageCheckboxState => {
	if (pageIds.length === 0) {
		return 'none';
	}
	const selectedCount = pageIds.filter((id) => isRowSelected(state, id)).length;
	if (selectedCount === 0) {
		return 'none';
	}

	return selectedCount === pageIds.length ? 'all' : 'some';
};
