import { ProgramService } from '@socialincome/shared/src/database/services/program/program.service';

export class ProgramUtils {
	private static readonly programService = new ProgramService();

	static async getOrCreateSocialIncomeProgramId(orgId: string): Promise<string | null> {
		const result = await this.programService.create({
			name: 'Social Income',
			viewerOrganizationId: orgId,
			operatorOrganizationId: orgId,
			totalPayments: 36,
			payoutAmount: 700,
			payoutCurrency: 'SLE',
			payoutInterval: 'monthly',
		});

		if (result.success) return result.data.id;

		const existingProgram = await this.programService.findProgramByName('Social Income');
		if (existingProgram) {
			console.log('ℹ️ Program "Social Income" already exists. Continuing...');
			return existingProgram.id;
		}

		console.error('❌ Could not resolve program "Social Income".');
		return null;
	}
}
