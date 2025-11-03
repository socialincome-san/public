import { PayoutStatus, Prisma } from '@prisma/client';
import { PaymentStatus } from '@socialincome/shared/src/types/payment';
import { BaseTransformer } from '../core/base.transformer';
import { FirestorePayoutWithRecipient } from './payout.types';

export class PayoutTransformer extends BaseTransformer<FirestorePayoutWithRecipient, Prisma.PayoutCreateInput> {
	transform = async (input: FirestorePayoutWithRecipient[]): Promise<Prisma.PayoutCreateInput[]> => {
		const transformed: Prisma.PayoutCreateInput[] = [];
		let skippedTest = 0;

		for (const { payout, recipient } of input) {
			if (recipient.test_recipient) {
				skippedTest++;
				continue;
			}

			transformed.push({
				legacyFirestoreId: `${recipient.id}_${payout.id}`,
				amount: new Prisma.Decimal(payout.amount),
				amountChf: payout.amount_chf ? new Prisma.Decimal(payout.amount_chf) : null,
				currency: payout.currency ?? '',
				paymentAt: payout.payment_at?.toDate() ?? null,
				status: this.mapStatus(payout.status),
				phoneNumber: payout.phone_number ? `+${payout.phone_number}` : null,
				comments: payout.comments ?? null,
				recipient: {
					connect: { legacyFirestoreId: recipient.id },
				},
			});
		}

		if (skippedTest > 0) {
			console.log(`⚠️ Skipped ${skippedTest} test payouts (${transformed.length} transformed)`);
		}

		return transformed;
	};

	private mapStatus(status: PaymentStatus): PayoutStatus {
		switch (status) {
			case PaymentStatus.Created:
				return PayoutStatus.created;
			case PaymentStatus.Paid:
				return PayoutStatus.paid;
			case PaymentStatus.Confirmed:
				return PayoutStatus.confirmed;
			case PaymentStatus.Contested:
				return PayoutStatus.contested;
			case PaymentStatus.Failed:
				return PayoutStatus.failed;
			default:
				throw new Error(`Unknown status ${status}`);
		}
	}
}
