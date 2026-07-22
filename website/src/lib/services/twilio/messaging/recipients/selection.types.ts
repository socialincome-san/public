import type { MessagingRecipientFilters } from './recipients.types';

export type SelectionState =
	| { mode: 'include'; ids: Set<string> }
	| { mode: 'all-matching'; search: string; filters: MessagingRecipientFilters; excludedIds: Set<string> };

export type PageCheckboxState = 'all' | 'some' | 'none';
