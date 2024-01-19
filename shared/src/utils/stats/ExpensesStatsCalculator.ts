import _ from 'lodash';
import { FirestoreAdmin } from '../../firebase/admin/FirestoreAdmin';
import { Currency } from '../../types/currency';
import { Expense, EXPENSES_FIRESTORE_PATH, ExpenseType } from '../../types/expense';
import { getLatestExchangeRate } from '../exchangeRates';

type ExpenseStatsEntry = Expense & {
	amount: number;
};

export class ExpensesStatsCalculator {
	private expenses: _.Collection<ExpenseStatsEntry>;

	private constructor(expenses: _.Collection<ExpenseStatsEntry>) {
		this.expenses = expenses;
	}

	public static async build(firestoreAdmin: FirestoreAdmin, currency: Currency): Promise<ExpensesStatsCalculator> {
		let expenses = await firestoreAdmin.collection<Expense>(EXPENSES_FIRESTORE_PATH).get();
		const exchangeRate = await getLatestExchangeRate(firestoreAdmin, currency);

		return new ExpensesStatsCalculator(
			_(expenses.docs).map((doc) => {
				const data = doc.data();
				return { amount: exchangeRate * data.amount_chf, ...data };
			}),
		);
	}

	public totalExpensesBy(group: 'type' | 'year'): { [type in string]?: number } {
		return this.expenses
			.groupBy(group)
			.map((expenses, group) => ({ [group]: _.sumBy(expenses, 'amount') }))
			.reduce((a, b) => ({ ...a, ...b }), {});
	}

	public totalExpensesByYearAndType(): { [year: string]: { [type in ExpenseType]: number } } {
		return this.expenses
			.groupBy('year')
			.map((expenses, year) => ({
				[year]: _(expenses)
					.groupBy('type')
					.map((objs, type) => ({ [type]: _.sumBy(objs, 'amount') }))
					.reduce((a, b) => ({ ...a, ...b }), {}),
			}))
			.reduce((a, b) => ({ ...a, ...b }), {});
	}

	public allStats() {
		return {
			totalExpensesByYear: this.totalExpensesBy('year'),
			totalExpensesByType: this.totalExpensesBy('type'),
			totalExpensesByYearAndType: this.totalExpensesByYearAndType(),
		};
	}
}
