import { ContributionStatus, PaymentEventType, Prisma } from '@prisma/client';
import {
	BankWireContribution,
	ContributionSourceKey,
	Contribution as FirestoreContribution,
	StatusKey,
	StripeContribution,
} from '@socialincome/shared/src/types/contribution';
import { DEFAULT_CAMPAIGN } from '../../scripts/seed-defaults';
import { BaseTransformer } from '../core/base.transformer';
import { ContributionWithPayment, FirestoreContributionWithUser } from './contribution.types';

export class ContributionTransformer extends BaseTransformer<FirestoreContributionWithUser, ContributionWithPayment> {
	transform = async (input: FirestoreContributionWithUser[]): Promise<ContributionWithPayment[]> => {
		const transformed: ContributionWithPayment[] = [];
		let skippedCount = 0;

		for (const { contribution, user } of input) {
			if (user.test_user) {
				skippedCount++;
				continue;
			}

			const legacyId = `${user.id}_${contribution.id}`;

			transformed.push({
				contribution: {
					legacyFirestoreId: legacyId,
					amount: contribution.amount,
					amountChf: contribution.amount_chf ?? 0,
					feesChf: contribution.fees_chf,
					currency: contribution.currency ?? '',
					status: this.mapStatus(contribution.status),
					contributor: { connect: { legacyFirestoreId: user.id } },
					campaign: contribution.campaign_path
						? { connect: { legacyFirestoreId: contribution.campaign_path.id } }
						: { connect: { title: DEFAULT_CAMPAIGN.title } },
					paymentEvent: { create: this.buildPaymentEvent(contribution) },
				},
			});
		}

		if (skippedCount > 0) {
			console.log(`⚠️ Skipped ${skippedCount} test contributor contributions`);
		}

		return transformed;
	};

	private buildPaymentEvent(contribution: FirestoreContribution): Prisma.PaymentEventCreateWithoutContributionInput {
		return {
			type: this.mapPaymentType(contribution.source),
			transactionId: this.extractTransactionId(contribution),
			metadata: this.extractMetadata(contribution),
		};
	}

	private extractTransactionId(contribution: FirestoreContribution): string | null {
		switch (contribution.source) {
			case ContributionSourceKey.STRIPE: {
				const stripe = contribution as StripeContribution;
				return stripe.reference_id ?? null;
			}
			case ContributionSourceKey.WIRE_TRANSFER: {
				const wire = contribution as BankWireContribution;
				return wire.transaction_id ?? wire.reference_id ?? null;
			}
			default:
				return null;
		}
	}

	private extractMetadata(contribution: FirestoreContribution): Prisma.InputJsonValue | Prisma.JsonNullValueInput {
		if (contribution.source === ContributionSourceKey.WIRE_TRANSFER) {
			const bank = contribution as BankWireContribution;
			return bank.raw_content ? { raw_content: bank.raw_content } : Prisma.JsonNull;
		}
		return Prisma.JsonNull;
	}

	private mapPaymentType(source: ContributionSourceKey): PaymentEventType {
		switch (source) {
			case ContributionSourceKey.STRIPE:
				return PaymentEventType.stripe;
			case ContributionSourceKey.WIRE_TRANSFER:
				return PaymentEventType.bank_transfer;
			case ContributionSourceKey.BENEVITY:
				return PaymentEventType.benevity;
			case ContributionSourceKey.CASH:
				return PaymentEventType.cash;
			case ContributionSourceKey.RAISENOW:
				return PaymentEventType.raisenow;
			default:
				throw new Error(`Unknown contribution source ${source}`);
		}
	}

	private mapStatus(status: StatusKey): ContributionStatus {
		switch (status) {
			case StatusKey.SUCCEEDED:
				return ContributionStatus.succeeded;
			case StatusKey.FAILED:
				return ContributionStatus.failed;
			case StatusKey.PENDING:
				return ContributionStatus.pending;
			default:
				throw new Error(`Unknown contribution status ${status}`);
		}
	}
}
