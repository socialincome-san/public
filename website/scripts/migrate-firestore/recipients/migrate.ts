import { Exporter } from './exporter';
import { Importer } from './importer';
import { Transformer } from './transformer';

const migrate = async () => {
	const exporter = new Exporter();
	const transformer = new Transformer();
	const importer = new Importer();

	console.info('🚀 Starting Firestore recipient migration...');

	const exportedData = await exporter.export();
	console.info(`📦 Exported ${exportedData.length} recipients from Firestore`);

	const transformedData = await transformer.transform(exportedData);
	console.info(`🔧 Transformed ${transformedData.length} recipients`);

	const insertedCount = await importer.import(transformedData);
	console.info(`✅ Successfully inserted ${insertedCount} recipients into Cloud SQL`);
};

migrate()
	.then(() => {
		console.info('🎉 Migration completed successfully');
	})
	.catch((error) => {
		console.error('❌ Migration failed:', error);
		process.exit(1);
	});
