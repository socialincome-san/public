import { ProgramService } from '@socialincome/shared/src/database/services/program/program.service';

export class ProgramUtils {
	private static readonly programService = new ProgramService();

	static async getOrCreateDefaultProgramId(orgId: string): Promise<string | null> {
		const result = await this.programService.create({
			name: 'Genesis',
			viewerOrganizationId: orgId,
			operatorOrganizationId: orgId,
			totalPayments: 36,
			payoutAmount: 700,
			payoutCurrency: 'SLE',
			payoutInterval: 'monthly',
			country: 'Sierra Leone',
		});

		if (result.success) return result.data.id;

		const existingProgram = await this.programService.findProgramByName('Genesis');
		if (existingProgram) {
			console.log('ℹ️ Program "Genesis" already exists. Continuing...');
			return existingProgram.id;
		}

		console.error('❌ Could not resolve program "Genesis".');
		return null;
	}
}
