import { buildCollection, buildProperties } from '@camberi/firecms';
import { OperationalExpense, OPERATIONAL_EXPENSE_FIRESTORE_PATH } from '@socialincome/shared/types';

export const operationalExpensesCollection = buildCollection<OperationalExpense>({
	name: 'Operational Expenses',
	group: 'Finances',
	path: OPERATIONAL_EXPENSE_FIRESTORE_PATH,
	textSearchEnabled: false,
	icon: 'LocalAtm',
	description: 'Add operational costs for transparency page',
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
