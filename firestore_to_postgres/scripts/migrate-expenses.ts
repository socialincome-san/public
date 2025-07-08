import 'dotenv/config';
import { ExpenseMigrator } from '../src/expense/expense.migrator';

const main = async (): Promise<void> => {
	try {
		const migrator = new ExpenseMigrator();
		await migrator.migrate();
	} catch (err) {
		console.error('❌ Expense migration failed:', err);
		process.exit(1);
	}
};

main();
