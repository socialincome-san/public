import { BaseMigrator } from '../core/base.migrator';
import { DonationCertificatesExtractor } from './donation-certificate.extractor';
import { DonationCertificatesImporter } from './donation-certificate.importer';
import { DonationCertificatesTransformer } from './donation-certificate.transformer';

export class DonationCertificateMigrator extends BaseMigrator {
	private readonly extractor = new DonationCertificatesExtractor();
	private readonly transformer = new DonationCertificatesTransformer();
	private readonly importer = new DonationCertificatesImporter();

	async migrate(): Promise<number> {
		console.log('🚀 Starting donation certificates migration...');

		const extracted = await this.extractor.extract();
		console.log(`📦 Extracted ${extracted.length} donation certificate records`);

		const transformed = await this.transformer.transform(extracted);
		console.log(`🔁 Transformed ${transformed.length} donation certificate records`);

		const insertedCount = await this.importer.import(transformed);
		console.log(`✅ Imported ${insertedCount} donation certificate records`);

		return insertedCount;
	}
}
