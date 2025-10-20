import 'dotenv/config';
import { ContributionMigrator } from '../src/contribution/contribution.migrator';

const main = async (): Promise<void> => {
	try {
		const migrator = new ContributionMigrator();
		await migrator.migrate();
	} catch (err) {
		console.log('❌ Contribution migration failed:', err);
		process.exit(1);
	}
};

main();
