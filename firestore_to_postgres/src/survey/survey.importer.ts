import { RecipientService } from '@socialincome/shared/src/database/services/recipient/recipient.service';
import { SurveyService } from '@socialincome/shared/src/database/services/survey/survey.service';
import { CreateSurveyInput } from '@socialincome/shared/src/database/services/survey/survey.types';
import { UserService } from '@socialincome/shared/src/database/services/user/user.service';
import { BaseImporter } from '../core/base.importer';
import { OrganizationUtils } from '../organization/organization.utils';
import { ProgramUtils } from '../program/program.utils';
import { SurveyWithEmail } from './survey.transformer';

type EmailRecipientMap = Map<string, string>;

export class SurveyImporter extends BaseImporter<SurveyWithEmail[]> {
	private readonly surveyService = new SurveyService();
	private readonly userService = new UserService();
	private readonly recipientService = new RecipientService();

	private emailRecipientMap: EmailRecipientMap = new Map();

	import = async (surveyBatches: SurveyWithEmail[][]): Promise<number> => {
		await this.buildRecipientMap();

		const organizationId = await OrganizationUtils.getOrCreateDefaultOrganizationId();
		if (!organizationId) {
			console.error('❌ Failed to resolve organization. Aborting import.');
			return 0;
		}

		const programId = await ProgramUtils.getOrCreateDefaultProgramId(organizationId);
		if (!programId) {
			console.error('❌ Failed to resolve program. Aborting import.');
			return 0;
		}

		let createdCount = 0;

		for (const surveys of surveyBatches) {
			for (const { recipientEmail, ...survey } of surveys) {
				const recipientId = this.getRecipientId(recipientEmail);
				if (!recipientId) {
					console.warn(`[SurveyImporter] Skipped survey: No recipient for email "${recipientEmail}"`);
					continue;
				}

				const result = await this.surveyService.create({
					...survey,
					recipientId,
					programId,
				} as CreateSurveyInput);

				if (result.success) {
					createdCount++;
				} else {
					console.warn(`[SurveyImporter] Failed to create survey for ${recipientEmail}: ${result.error}`);
				}
			}
		}

		return createdCount;
	};

	private async buildRecipientMap() {
		const userResult = await this.userService.findMany();
		if (!userResult.success || !userResult.data) {
			throw new Error('❌ Failed to fetch users');
		}

		const recipientResult = await this.recipientService.findMany();
		if (!recipientResult.success || !recipientResult.data) {
			throw new Error('❌ Failed to fetch recipients');
		}

		const userIdToEmailMap = new Map(userResult.data.map((user) => [user.id, user.email.toLowerCase()]));

		for (const recipient of recipientResult.data) {
			const email = userIdToEmailMap.get(recipient.userId);
			if (email) {
				this.emailRecipientMap.set(email, recipient.id);
			}
		}
	}

	private getRecipientId(email: string): string | null {
		return this.emailRecipientMap.get(email.toLowerCase()) ?? null;
	}
}
