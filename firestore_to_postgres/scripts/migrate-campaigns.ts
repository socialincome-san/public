import 'dotenv/config';
import { CampaignMigrator } from '../src/campaign/campaign.migrator';

const main = async (): Promise<void> => {
	try {
		const migrator = new CampaignMigrator();
		await migrator.migrate();
	} catch (err) {
		console.log('❌ Campaign migration failed:', err);
		process.exit(1);
	}
};

main();
