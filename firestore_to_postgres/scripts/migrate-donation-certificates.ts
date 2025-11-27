import 'dotenv/config';
import { DonationCertificateMigrator } from '../src/donation-certificate/donation-certificate.migrator';

const main = async (): Promise<void> => {
	try {
		const migrator = new DonationCertificateMigrator();
		await migrator.migrate();
	} catch (err) {
		console.log('❌ Donation certificate migration failed:', err);
		process.exit(1);
	}
};

main();
