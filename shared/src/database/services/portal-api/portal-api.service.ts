import { Payout, PayoutStatus, Survey } from '@prisma/client';
import { authAdmin } from '@socialincome/website/src/lib/firebase/firebase-admin';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { RecipientExpanded, RecipientUserUpdateInput } from './portal-api.types';

export class PortalApiService extends BaseService {
	private normalizePhone(phone?: string | null) {
		return phone ? phone.replace(/^\+/, '') : null;
	}

	async getRecipientFromRequest(request: Request): Promise<ServiceResult<RecipientExpanded>> {
		const decoded = await this.requireIdToken(request);
		if (!decoded) return this.resultFail('Unauthorized', 401);

		const phone = this.normalizePhone(decoded.phone_number ?? null);
		if (!phone) return this.resultFail('Phone number not present in token', 400);

		try {
			const recipient = await this.db.recipient.findFirst({
				where: { user: { mobileMoneyPhone: phone } },
				include: {
					user: true,
					program: true,
					localPartner: {
						include: { user: true },
					},
				},
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

	async getSurveysByRecipientId(recipientId: string): Promise<ServiceResult<Survey[]>> {
		try {
			const surveys = await this.db.survey.findMany({
				where: { recipientId },
				orderBy: [{ dueDateAt: 'desc' }, { createdAt: 'desc' }],
			});
			return this.resultOk(surveys, 200);
		} catch {
			return this.resultFail('Could not fetch surveys', 500);
		}
	}

	async updateRecipientUserFields(
		recipientId: string,
		data: RecipientUserUpdateInput,
	): Promise<ServiceResult<RecipientExpanded>> {
		try {
			const updatedRecipient = await this.db.recipient.update({
				where: { id: recipientId },
				data: {
					user: {
						update: {
							firstName: data.firstName,
							lastName: data.lastName,
							// TODO: add more fields here in the future
						},
					},
				},
				include: {
					user: true,
					program: true,
					localPartner: { include: { user: true } },
				},
			});

			return this.resultOk(updatedRecipient, 200);
		} catch {
			return this.resultFail('Failed to update user', 500);
		}
	}

	private async requireIdToken(request: Request) {
		const header = request.headers.get('authorization');
		if (!header?.startsWith('Bearer ')) return null;
		const token = header.slice('Bearer '.length);
		try {
			return await authAdmin.auth.verifyIdToken(token);
		} catch (e) {
			console.error('Auth error:', e);
			return null;
		}
	}
}
