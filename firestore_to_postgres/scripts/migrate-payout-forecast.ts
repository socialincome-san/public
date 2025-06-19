import 'dotenv/config';
import { PayoutForecastMigrator } from '../src/payout-forecast/payout-forecast.migrator';

const main = async (): Promise<void> => {
	try {
		const migrator = new PayoutForecastMigrator();
		await migrator.migrate();
	} catch (err) {
		console.error('❌ Payout forecast migration failed:', err);
		process.exit(1);
	}
};

main();
