import 'dotenv/config';
import { ContributorMigrator } from '../src/contributor/contributor.migrator';

const main = async (): Promise<void> => {
	try {
		const migrator = new ContributorMigrator();
		await migrator.migrate();
	} catch (err) {
		console.log('❌ Contributor migration failed:', err);
		process.exit(1);
	}
};

main();
