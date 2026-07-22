import type { MessagingRecipientFilters } from './recipients.types';
import type { SelectionState } from './selection.types';

export type RowFetcher = (
	page: number,
	pageSize: number,
	search: string,
	filters: MessagingRecipientFilters,
) => Promise<{ ids: string[]; totalCount: number }>;

export async function resolveSelectionToIds(
	selection: SelectionState,
	fetcher: RowFetcher,
	pageSize = 200,
): Promise<string[]> {
	if (selection.mode === 'include') {
		return Array.from(selection.ids);
	}

	const collected: string[] = [];
	let page = 1;
	let totalCount = Number.POSITIVE_INFINITY;

	while (collected.length < totalCount) {
		const result = await fetcher(page, pageSize, selection.search, selection.filters);
		totalCount = result.totalCount;
		for (const id of result.ids) {
			if (!selection.excludedIds.has(id)) {
				collected.push(id);
			}
		}
		if (result.ids.length < pageSize) {
			break;
		}
		page += 1;
	}

	return collected;
}
