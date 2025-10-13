import { BaseMigrator } from '../core/base.migrator';
import { DonationCertificateExtractor } from './donation-certificate.extractor';
import { DonationCertificateImporter } from './donation-certificate.importer';
import { DonationCertificateTransformer } from './donation-certificate.transformer';

export class DonationCertificateMigrator extends BaseMigrator {
	private readonly extractor = new DonationCertificateExtractor();
	private readonly transformer = new DonationCertificateTransformer();
	private readonly importer = new DonationCertificateImporter();

	async migrate(): Promise<number> {
		console.log('🚀 Starting donation certificate migration...');

		const extracted = await this.extractor.extract();
		console.log(`📦 Extracted ${extracted.length} certificates`);

		const transformed = await this.transformer.transform(extracted);
		console.log(`🔁 Transformed ${transformed.length} certificates`);

		const insertedCount = await this.importer.import(transformed);
		console.log(`✅ Imported ${insertedCount} certificates`);

		return insertedCount;
	}
}
