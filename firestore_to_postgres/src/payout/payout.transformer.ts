import { PayoutStatus } from '@prisma/client';
import { CreatePayoutInput } from '@socialincome/shared/src/database/services/payout/payout.types';
import { BaseTransformer } from '../core/base.transformer';
import { PayoutWithRecipient } from './payout.extractor';

export type PayoutWithEmail = Omit<CreatePayoutInput, 'recipientId'> & {
	recipientEmail: string;
};

export class PayoutsTransformer extends BaseTransformer<PayoutWithRecipient, PayoutWithEmail[]> {
	transform = async (input: PayoutWithRecipient[]): Promise<PayoutWithEmail[][]> => {
		const payouts: PayoutWithEmail[] = input.map(({ payout, recipient }) => {
			const email = recipient.email?.trim()
				? recipient.email.toLowerCase()
				: this.generateFallbackEmail(recipient.first_name, recipient.last_name);

			return {
				amount: payout.amount,
				currency: payout.currency,
				paymentAt: payout.payment_at.toDate(),
				status: this.isValidStatus(payout.status) ? payout.status : PayoutStatus.created,
				message: payout.message ? JSON.stringify(payout.message) : null,
				recipientEmail: email,
				amountChf: null,
				phoneNumber: null,
				comments: null,
			};
		});

		return [payouts];
	};

	private isValidStatus(status: string): status is PayoutStatus {
		return Object.values(PayoutStatus).includes(status as PayoutStatus);
	}

	private generateFallbackEmail(firstName: string, lastName: string): string {
		const namePart = `${firstName}.${lastName}`.toLowerCase().replace(/[^a-z0-9]/g, '');
		return `${namePart}@autocreated.socialincome`;
	}
}
