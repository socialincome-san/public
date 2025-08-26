import { ContributionInterval, ContributionSource, ContributionStatus } from '@prisma/client';
import { CreateContributionInput } from '@socialincome/shared/src/database/services/contribution/contribution.types';
import { BaseTransformer } from '../core/base.transformer';
import { ContributionWithUser } from './contribution.extractor';

export type ContributionWithEmail = Omit<
	CreateContributionInput,
	'contributorId' | 'campaignId' | 'organizationId' | 'programId'
> & {
	contributorEmail: string;
};

export type ContributorWithEmail = { email: string };

export type TransformedContributions = {
	contributors: ContributorWithEmail[];
	contributions: ContributionWithEmail[];
};

export class ContributionsTransformer extends BaseTransformer<ContributionWithUser, TransformedContributions> {
	transform = async (input: ContributionWithUser[]): Promise<TransformedContributions[]> => {
		const seenEmails = new Set<string>();
		const contributors: ContributorWithEmail[] = [];
		const contributions: ContributionWithEmail[] = [];

		for (const { user, contribution } of input) {
			const email = user.email.toLowerCase();

			if (!seenEmails.has(email)) {
				contributors.push({ email });
				seenEmails.add(email);
			}

			contributions.push({
				amount: contribution.amount,
				amountChf: contribution.amount_chf,
				feesChf: contribution.fees_chf,
				contributionInterval: this.mapInterval(contribution.monthly_interval),
				source: this.mapSource(contribution.source),
				status: this.mapStatus(contribution.status),
				currency: contribution.currency,
				referenceId: contribution.reference_id ?? '',
				transactionId: 'transaction_id' in contribution ? (contribution.transaction_id ?? null) : null,
				rawContent: 'raw_content' in contribution ? (contribution.raw_content ?? null) : null,
				contributorEmail: email,
			});
		}

		return [{ contributors, contributions }];
	};

	private mapInterval(value: number): ContributionInterval {
		switch (value) {
			case 0:
				return ContributionInterval.one_time;
			case 1:
				return ContributionInterval.monthly;
			case 3:
				return ContributionInterval.quarterly;
			case 12:
				return ContributionInterval.annually;
			default:
				// fallback: treat unknown numeric cadence as monthly
				return ContributionInterval.monthly;
		}
	}

	private mapSource(source: string): ContributionSource {
		const normalized = source.replace(/-/g, '_').toLowerCase();
		const validSources = Object.values(ContributionSource);
		if (validSources.includes(normalized as ContributionSource)) {
			return normalized as ContributionSource;
		}
		console.warn(`[Transformer] Unknown contribution source "${source}", defaulting to 'stripe'`);
		return ContributionSource.stripe;
	}

	private mapStatus(status: string): ContributionStatus {
		const validStatuses = Object.values(ContributionStatus);
		if (validStatuses.includes(status as ContributionStatus)) {
			return status as ContributionStatus;
		}
		console.warn(`[Transformer] Unknown contribution status "${status}", defaulting to 'unknown'`);
		return ContributionStatus.unknown;
	}
}
