import { ContributionService } from '@socialincome/shared/src/database/services/contribution/contribution.service';
import { CreateContributionInput } from '@socialincome/shared/src/database/services/contribution/contribution.types';
import { ContributorService } from '@socialincome/shared/src/database/services/contributor/contributor.service';
import { UserService } from '@socialincome/shared/src/database/services/user/user.service';
import { BaseImporter } from '../core/base.importer';
import { TransformedContributions } from './contribution.transformer';

type UserContributorMap = Map<string, { userId: string; contributorId: string | null }>;

export class ContributionsImporter extends BaseImporter<TransformedContributions> {
	private readonly contributionService = new ContributionService();
	private readonly contributorService = new ContributorService();
	private readonly userService = new UserService();

	private userContributorMap: UserContributorMap = new Map();

	import = async (transformedList: TransformedContributions[]): Promise<number> => {
		await this.buildUserMap();
		await this.processContributors(transformedList);
		return this.processContributions(transformedList);
	};

	// 🔍 Load all users and populate userContributorMap
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

	// 👥 Create contributors and fill contributorId in map
	private async processContributors(transformedList: TransformedContributions[]) {
		for (const { contributors } of transformedList) {
			for (const contributor of contributors) {
				const entry = this.userContributorMap.get(contributor.email.toLowerCase());
				if (!entry) {
					console.warn(`[ContributionsImporter] Skipped contributor: No user for email "${contributor.email}"`);
					continue;
				}

				if (entry.contributorId) continue;

				const exists = await this.contributorService.exists(entry.userId);
				if (!exists) {
					const result = await this.contributorService.create({ userId: entry.userId });
					if (!result.success) {
						console.warn(
							`[ContributionsImporter] Failed to create contributor for ${contributor.email}: ${result.error}`,
						);
						continue;
					}
				}

				const contributorRecord = await this.contributorService.getByUserId(entry.userId);
				if (!contributorRecord) {
					console.warn(`[ContributionsImporter] Contributor not found after creation for ${contributor.email}`);
					continue;
				}

				this.userContributorMap.set(contributor.email.toLowerCase(), {
					...entry,
					contributorId: contributorRecord.id,
				});
			}
		}
	}

	// 💸 Create contributions using contributorId from the map
	private async processContributions(transformedList: TransformedContributions[]): Promise<number> {
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

				const { contributorEmail, ...data } = contribution;

				const result = await this.contributionService.create({
					...data,
					contributorId,
					organizationId: null,
					campaignId: null,
				} as CreateContributionInput);

				if (result.success) {
					createdCount++;
				} else {
					console.warn(`[ContributionsImporter] Failed to create contribution for ${contributorEmail}:`, result.error);
				}
			}
		}

		return createdCount;
	}

	// 🧩 Get contributorId from the map
	private getContributorId(email: string): string | null {
		const entry = this.userContributorMap.get(email.toLowerCase());
		return entry?.contributorId ?? null;
	}
}
