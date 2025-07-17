import 'dotenv/config';
import { ExchangeRateMigrator } from '../src/exchange-rate/exchange-rate.migrator';

const main = async (): Promise<void> => {
	try {
		const migrator = new ExchangeRateMigrator();
		await migrator.migrate();
	} catch (err) {
		console.error('❌ Exchange rate migration failed:', err);
		process.exit(1);
	}
};

main();
