import {
	OPERATIONAL_EXPENSE_FIRESTORE_PATH,
	OperationalExpense,
} from '@socialincome/shared/src/types/OperationalExpense';
import { buildProperties } from 'firecms';
import { buildAuditedCollection } from './shared';

export const operationalExpensesCollection = buildAuditedCollection<OperationalExpense>({
	name: 'Operational Expenses',
	group: 'Finances',
	path: OPERATIONAL_EXPENSE_FIRESTORE_PATH,
	textSearchEnabled: false,
	icon: 'LocalAtm',
	description: 'Add operational costs for transparency page',
	initialSort: ['created', 'desc'],
	permissions: ({ authController }) => ({
		edit: true,
		create: true,
		delete: true,
	}),
	properties: buildProperties<OperationalExpense>({
		name: {
			dataType: 'string',
			name: 'Name',
			validation: { required: true },
		},
		type: {
			dataType: 'string',
			name: 'Type',
			enumValues: {
				administrative: 'administrative',
				fundraising: 'fundraising',
			},
			validation: { required: true },
		},
		created: {
			dataType: 'date',
			name: 'Created',
			mode: 'date',
			validation: { required: true },
		},
		amount_chf: {
			dataType: 'number',
			name: 'Amount Chf',
		},
	}),
});
