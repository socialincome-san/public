import 'dotenv/config';
import { UserMigrator } from '../src/user/user.migrator';

const main = async (): Promise<void> => {
	try {
		const migrator = new UserMigrator();
		await migrator.migrate();
	} catch (err) {
		console.error('❌ Migration failed:', err);
		process.exit(1);
	}
};

main();
