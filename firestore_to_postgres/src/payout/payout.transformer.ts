import { PayoutStatus, Prisma } from '@prisma/client';
import { PaymentStatus } from '@socialincome/shared/src/types/payment';
import { BaseTransformer } from '../core/base.transformer';
import { FirestorePayoutWithRecipient } from './payout.types';

export class PayoutTransformer extends BaseTransformer<FirestorePayoutWithRecipient, Prisma.PayoutCreateInput> {
	transform = async (input: FirestorePayoutWithRecipient[]): Promise<Prisma.PayoutCreateInput[]> => {
		return input.map(({ payout, recipient }) => ({
			legacyFirestoreId: `${recipient.id}_${payout.id}`,
			amount: new Prisma.Decimal(payout.amount ?? 0),
			amountChf: payout.amount_chf ? new Prisma.Decimal(payout.amount_chf) : undefined,
			currency: payout.currency ?? 'SLE',
			paymentAt: payout.payment_at?.toDate() ?? new Date(),
			status: this.mapStatus(payout.status),
			phoneNumber: payout.phone_number?.toString() ?? null,
			comments: payout.comments ?? null,
			message: payout.message ? JSON.stringify(payout.message) : null,
			recipient: {
				connect: { legacyFirestoreId: recipient.id },
			},
		}));
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
				return PayoutStatus.other;
		}
	}
}
