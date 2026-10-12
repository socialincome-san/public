import type { TableFilterConfig } from '@/components/data-table/table-config.types';

// A filter that only a link from a record dialog sets, e.g. ?recipientId=. It is listed only while active,
// because a dropdown with every record would not be usable, and stays visible so it can be cleared.
export const linkedRecordFilter = (filter: TableFilterConfig): TableFilterConfig[] =>
	filter.options.length > 0 ? [filter] : [];
