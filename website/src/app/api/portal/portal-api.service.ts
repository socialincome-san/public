import { requireIdToken } from '@/lib/firebase/require-id-token';
import { Payout, PayoutStatus, Recipient } from '@prisma/client';
import { BaseService } from '@socialincome/shared/src/database/services/core/base.service';
import { ServiceResult } from '@socialincome/shared/src/database/services/core/base.types';

export class PortalApiService extends BaseService {
	private normalizePhone(phone?: string | null) {
		return phone ? phone.replace(/^\+/, '') : null;
	}

	async getRecipientFromRequest(request: Request): Promise<ServiceResult<Recipient>> {
		const decoded = await requireIdToken(request);
		if (!decoded) return this.resultFail('Unauthorized', 401);

		const phone = this.normalizePhone(decoded.phone_number ?? null);
		if (!phone) return this.resultFail('Phone number not present in token', 400);

		try {
			const recipient = await this.db.recipient.findFirst({
				where: { user: { mobileMoneyPhone: phone } },
			});
			if (!recipient) return this.resultFail(`No recipient found with mobileMoneyPhone "${phone}"`, 404);
			return this.resultOk(recipient, 200);
		} catch {
			return this.resultFail(`Could not fetch recipient for phone "${phone}"`, 500);
		}
	}

	async getPayoutsByRecipientId(recipientId: string): Promise<ServiceResult<Payout[]>> {
		try {
			const payouts = await this.db.payout.findMany({
				where: { recipientId },
				orderBy: { paymentAt: 'desc' },
			});
			return this.resultOk(payouts, 200);
		} catch {
			return this.resultFail('Could not fetch payouts', 500);
		}
	}

	async getPayoutByRecipientAndId(recipientId: string, payoutId: string): Promise<ServiceResult<Payout>> {
		try {
			const payout = await this.db.payout.findFirst({ where: { id: payoutId, recipientId } });
			if (!payout) return this.resultFail(`Payout "${payoutId}" not found for recipient`, 404);
			return this.resultOk(payout, 200);
		} catch {
			return this.resultFail(`Could not fetch payout "${payoutId}"`, 500);
		}
	}

	async updatePayoutStatus(
		recipientId: string,
		payoutId: string,
		status: PayoutStatus,
	): Promise<ServiceResult<Payout>> {
		try {
			const payout = await this.db.payout.findFirst({ where: { id: payoutId, recipientId } });
			if (!payout) return this.resultFail(`Payout "${payoutId}" not found for recipient`, 404);

			const updated = await this.db.payout.update({ where: { id: payout.id }, data: { status } });
			return this.resultOk(updated, 200);
		} catch {
			return this.resultFail(`Failed to update payout "${payoutId}"`, 500);
		}
	}
}
