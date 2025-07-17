import 'dotenv/config';
import { PayoutMigrator } from '../src/payout/payout.migrator';

const main = async (): Promise<void> => {
	try {
		const migrator = new PayoutMigrator();
		await migrator.migrate();
	} catch (err) {
		console.error('❌ Payout migration failed:', err);
		process.exit(1);
	}
};

main();
