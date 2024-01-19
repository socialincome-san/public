import { buildProperties } from 'firecms';
import { Expense, EXPENSES_FIRESTORE_PATH, ExpenseType } from '../../../shared/src/types/expense';
import { buildAuditedCollection } from './shared';

export const expensesCollection = buildAuditedCollection<Expense>({
	name: 'Expenses',
	group: 'Finances',
	path: EXPENSES_FIRESTORE_PATH,
	textSearchEnabled: false,
	icon: 'LocalAtm',
	description: 'Project expenses displayed on transparency page',
	initialSort: ['year', 'desc'],
	permissions: {
		edit: true,
		create: true,
		delete: true,
	},
	properties: buildProperties<Expense>({
		type: {
			dataType: 'string',
			name: 'Type',
			enumValues: [
				{ id: ExpenseType.DeliveryFees, label: 'Delivery fees' },
				{ id: ExpenseType.DonationFees, label: 'Donation fees' },
				{ id: ExpenseType.ExchangeRateFluctuation, label: 'Exchange rate fluctuation' },
			],
			validation: { required: true },
		},
		year: {
			dataType: 'number',
			name: 'Year',
			enumValues: { 2020: '2020', 2021: '2021', 2022: '2022', 2023: '2023', 2024: '2024', 2025: '2025' },
			validation: { required: true },
		},
		amount_chf: {
			dataType: 'number',
			name: 'Amount Chf',
			validation: { required: true },
		},
	}),
});
