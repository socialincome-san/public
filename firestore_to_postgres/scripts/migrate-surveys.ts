import 'dotenv/config';
import { SurveyMigrator } from '../src/survey/survey.migrator';

const main = async (): Promise<void> => {
	try {
		const migrator = new SurveyMigrator();
		await migrator.migrate();
	} catch (err) {
		console.error('❌ Survey migration failed:', err);
		process.exit(1);
	}
};

main();
