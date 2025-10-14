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
		return input.map(
			({ contribution, user }): ContributionWithPayment => ({
				contribution: {
					legacyFirestoreId: contribution.id,
					amount: contribution.amount,
					amountChf: contribution.amount_chf,
					feesChf: contribution.fees_chf,
					currency: contribution.currency ?? 'CHF',
					status: this.mapStatus(contribution.status),
					contributor: { connect: { legacyFirestoreId: user.id } },
					campaign: contribution.campaign_path
						? { connect: { legacyFirestoreId: contribution.campaign_path.id } }
						: { connect: { title: DEFAULT_CAMPAIGN.title } },
					paymentEvent: { create: this.buildPaymentEvent(contribution) },
				},
			}),
		);
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
			case ContributionSourceKey.STRIPE:
				return (contribution as StripeContribution).reference_id ?? null;
			case ContributionSourceKey.WIRE_TRANSFER:
				return (
					(contribution as BankWireContribution).transaction_id ??
					(contribution as BankWireContribution).reference_id ??
					null
				);
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
			default:
				return PaymentEventType.stripe;
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
				return ContributionStatus.succeeded;
		}
	}
}
