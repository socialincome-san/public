import 'dotenv/config';
import { AdminMigrator } from '../src/admin/admin.migrator';

const main = async (): Promise<void> => {
	try {
		const migrator = new AdminMigrator();
		await migrator.migrate();
	} catch (err) {
		console.error('❌ Admin migration failed:', err);
		process.exit(1);
	}
};

main();
