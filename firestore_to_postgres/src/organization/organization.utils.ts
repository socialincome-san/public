import { OrganizationService } from '@socialincome/shared/src/database/services/organization/organization.service';

export class OrganizationUtils {
	private static readonly orgService = new OrganizationService();

	static async getOrCreateSocialIncomeOrganizationId(): Promise<string | null> {
		const result = await this.orgService.create({ name: 'Social Income' });

		if (result.success) return result.data.id;

		const existingOrg = await this.orgService['checkIfOrganizationExists']('Social Income');
		if (existingOrg) {
			console.log('ℹ️ Organization "Social Income" already exists. Continuing...');
			return existingOrg.id;
		}

		console.error('❌ Could not resolve organization "Social Income".');
		return null;
	}
}
