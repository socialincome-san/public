import { ContributionService } from '@socialincome/shared/src/database/services/contribution/contribution.service';
import { CreateContributionInput } from '@socialincome/shared/src/database/services/contribution/contribution.types';
import { ContributorService } from '@socialincome/shared/src/database/services/contributor/contributor.service';
import { UserService } from '@socialincome/shared/src/database/services/user/user.service';
import { BaseImporter } from '../core/base.importer';
import { OrganizationUtils } from '../organization/organization.utils';
import { ProgramUtils } from '../program/program.utils';
import { TransformedContributions } from './contribution.transformer';

type UserContributorMap = Map<string, { userId: string; contributorId: string | null }>;

export class ContributionsImporter extends BaseImporter<TransformedContributions> {
	private readonly contributionService = new ContributionService();
	private readonly contributorService = new ContributorService();
	private readonly userService = new UserService();

	private userContributorMap: UserContributorMap = new Map();

	import = async (transformedList: TransformedContributions[]): Promise<number> => {
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

		await this.buildUserMap();
		await this.ensureContributors(transformedList);

		return this.createContributions(transformedList, programId);
	};

	private async buildUserMap() {
		const result = await this.userService.findMany();
		if (!result.success || !result.data) {
			throw new Error('❌ Failed to fetch users.');
		}

		for (const user of result.data) {
			this.userContributorMap.set(user.email.toLowerCase(), {
				userId: user.id,
				contributorId: null,
			});
		}
	}

	private async ensureContributors(transformedList: TransformedContributions[]) {
		for (const { contributors } of transformedList) {
			for (const { email } of contributors) {
				const key = email.toLowerCase();
				const entry = this.userContributorMap.get(key);
				if (!entry) {
					console.warn(`[ContributionsImporter] Skipped contributor: No user for email "${email}"`);
					continue;
				}
				if (entry.contributorId) continue;

				const exists = await this.contributorService.exists(entry.userId);
				if (!exists) {
					const createRes = await this.contributorService.create({ userId: entry.userId });
					if (!createRes.success) {
						console.warn(`[ContributionsImporter] Failed to create contributor for ${email}: ${createRes.error}`);
						continue;
					}
				}

				const contributorRecord = await this.contributorService.getByUserId(entry.userId);
				if (!contributorRecord) {
					console.warn(`[ContributionsImporter] Contributor not found after creation for ${email}`);
					continue;
				}

				this.userContributorMap.set(key, { ...entry, contributorId: contributorRecord.id });
			}
		}
	}

	private async createContributions(transformedList: TransformedContributions[], programId: string): Promise<number> {
		let createdCount = 0;

		for (const { contributions } of transformedList) {
			for (const contribution of contributions) {
				const contributorId = this.getContributorId(contribution.contributorEmail);
				if (!contributorId) {
					console.warn(
						`[ContributionsImporter] Skipped contribution: No contributor for email "${contribution.contributorEmail}"`,
					);
					continue;
				}

				const { contributorEmail, ...rest } = contribution;

				const payload: CreateContributionInput = {
					...rest,
					contributorId,
					programId,
					campaignId: null,
				};

				const res = await this.contributionService.create(payload);
				if (res.success) {
					createdCount++;
				} else {
					console.warn(`[ContributionsImporter] Failed to create contribution for ${contributorEmail}: ${res.error}`);
				}
			}
		}

		return createdCount;
	}

	private getContributorId(email: string): string | null {
		const entry = this.userContributorMap.get(email.toLowerCase());
		return entry?.contributorId ?? null;
	}
}
