import 'dotenv/config';
import { RecipientMigrator } from '../src/recipient/recipient.migrator';

const main = async (): Promise<void> => {
	try {
		const migrator = new RecipientMigrator();
		await migrator.migrate();
	} catch (err) {
		console.log('❌ Recipient migration failed:', err);
		process.exit(1);
	}
};

main();
