import { DonationCertificateService } from '@socialincome/shared/src/database/services/donation-certificate/donation-certificate.service';
import { UserService } from '@socialincome/shared/src/database/services/user/user.service';
import { BaseImporter } from '../core/base.importer';
import { CreateDonationCertificateInputWithoutFK } from './donation-certificate.transformer';

type EmailUserIdMap = Map<string, string>;

export class DonationCertificatesImporter extends BaseImporter<CreateDonationCertificateInputWithoutFK> {
	private readonly donationCertificateService = new DonationCertificateService();
	private readonly userService = new UserService();
	private emailUserIdMap: EmailUserIdMap = new Map();

	import = async (certificates: CreateDonationCertificateInputWithoutFK[]): Promise<number> => {
		await this.buildUserMap();

		let createdCount = 0;

		for (const { email, ...certificate } of certificates) {
			const userId = this.getUserId(email);
			if (!userId) {
				console.warn(`[DonationCertificatesImporter] Skipped certificate: No user for email "${email}"`);
				continue;
			}

			const result = await this.donationCertificateService.create({
				...certificate,
				userId,
			});

			if (result.success) {
				createdCount++;
			} else {
				console.warn(`[DonationCertificatesImporter] Failed to create certificate for ${email}: ${result.error}`);
			}
		}

		return createdCount;
	};

	private async buildUserMap() {
		const userResult = await this.userService.findMany();
		if (!userResult.success || !userResult.data) {
			throw new Error('❌ Failed to fetch users');
		}

		for (const user of userResult.data) {
			this.emailUserIdMap.set(user.email.toLowerCase(), user.id);
		}
	}

	private getUserId(email: string): string | null {
		return this.emailUserIdMap.get(email.toLowerCase()) ?? null;
	}
}
