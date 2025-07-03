import 'dotenv/config';
import { LocalPartnerMigrator } from '../src/local-partner/local-partner-migrator';

const main = async (): Promise<void> => {
	try {
		const migrator = new LocalPartnerMigrator();
		await migrator.migrate();
	} catch (err) {
		console.error('❌ Local Partner migration failed:', err);
		process.exit(1);
	}
};

main();
