import { PayoutStatus } from '@/generated/prisma/client';
import { ProgramPermission } from '@/generated/prisma/enums';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { ProgramAccessReadService } from '../program-access/program-access-read.service';
import { PayoutCreateInput, PayoutEntity, PayoutPayload, PayoutUpdateInput } from './payout.types';

export class PayoutWriteService extends BaseService {
	private programAccessService = new ProgramAccessReadService();

	async updatePayoutStatus(userId: string, payoutId: string, newStatus: PayoutStatus): Promise<ServiceResult<string>> {
		try {
			const accessResult = await this.programAccessService.getAccessiblePrograms(userId);
			if (!accessResult.success) {
				return this.resultFail(accessResult.error);
			}

			const payout = await this.db.payout.findUnique({
				where: { id: payoutId },
				select: {
					id: true,
					status: true,
					recipient: { select: { programId: true } },
				},
			});

			if (!payout) {
				return this.resultFail('Payout not found');
			}

			const access = accessResult.data.find((p) => p.programId === payout.recipient.programId);
			if (!access) {
				return this.resultFail('Access denied for this payout');
			}

			if (access.permission !== ProgramPermission.operator) {
				return this.resultFail('You do not have permission to modify payouts for this program');
			}

			if (payout.status !== PayoutStatus.paid) {
				return this.resultFail('Only payouts with status "paid" can be updated');
			}

			await this.db.payout.update({
				where: { id: payoutId },
				data: { status: newStatus },
			});

			return this.resultOk(`Payout updated to "${newStatus}"`);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not update payout: ${JSON.stringify(error)}`);
		}
	}

	async create(userId: string, input: PayoutCreateInput): Promise<ServiceResult<PayoutPayload>> {
		const recipient = await this.db.recipient.findUnique({
			where: { id: input.recipient.connect.id },
			select: { programId: true },
		});

		if (!recipient) {
			return this.resultFail('Recipient not found');
		}

		if (recipient.programId) {
			const access = await this.programAccessService.getAccessiblePrograms(userId);
			if (!access.success) {
				return this.resultFail(access.error);
			}

			const allowed = access.data.find(
				(p) => p.programId === recipient.programId && p.permission === ProgramPermission.operator,
			);
			if (!allowed) {
				return this.resultFail('No edit access for this program');
			}
		}

		try {
			const created = await this.db.payout.create({
				data: input,
				include: {
					recipient: {
						select: {
							id: true,
							contact: { select: { firstName: true, lastName: true } },
							program: { select: { id: true, name: true } },
						},
					},
				},
			});

			return this.resultOk({
				id: created.id,
				amount: Number(created.amount),
				currency: created.currency,
				status: created.status,
				paymentAt: created.paymentAt,
				phoneNumber: created.phoneNumber,
				comments: created.comments,
				recipient: {
					id: created.recipient.id,
					firstName: created.recipient.contact.firstName,
					lastName: created.recipient.contact.lastName,
					programId: created.recipient.program && created.recipient.program.id,
					programName: created.recipient.program && created.recipient.program.name,
				},
			});
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not create payout: ${JSON.stringify(error)}`);
		}
	}

	async update(userId: string, input: PayoutUpdateInput): Promise<ServiceResult<PayoutPayload>> {
		const existing = await this.db.payout.findUnique({
			where: { id: input.id },
			select: { recipient: { select: { programId: true } } },
		});

		if (!existing) {
			return this.resultFail('Payout not found');
		}

		if (existing.recipient.programId) {
			const access = await this.programAccessService.getAccessiblePrograms(userId);
			if (!access.success) {
				return this.resultFail(access.error);
			}

			const allowed = access.data.some(
				(p) => p.programId === existing.recipient.programId && p.permission === ProgramPermission.operator,
			);
			if (!allowed) {
				return this.resultFail('No edit permission for this payout');
			}
		}

		try {
			const updated = await this.db.payout.update({
				where: { id: input.id },
				data: input,
				include: {
					recipient: {
						select: {
							id: true,
							contact: { select: { firstName: true, lastName: true } },
							program: { select: { id: true, name: true } },
						},
					},
				},
			});

			return this.resultOk({
				id: updated.id,
				amount: Number(updated.amount),
				currency: updated.currency,
				status: updated.status,
				paymentAt: updated.paymentAt,
				phoneNumber: updated.phoneNumber,
				comments: updated.comments,
				recipient: {
					id: updated.recipient.id,
					firstName: updated.recipient.contact.firstName,
					lastName: updated.recipient.contact.lastName,
					programId: updated.recipient.program && updated.recipient.program.id,
					programName: updated.recipient.program && updated.recipient.program.name,
				},
			});
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not update payout: ${JSON.stringify(error)}`);
		}
	}

	updateStatusByRecipient(
		recipientId: string,
		payoutId: string,
		status: PayoutStatus,
		comments?: string | null,
	): Promise<ServiceResult<PayoutEntity>> {
		return this.db.payout
			.findFirst({ where: { id: payoutId, recipientId } })
			.then((payout) => {
				if (!payout) {
					return this.resultFail(`Payout "${payoutId}" not found for recipient`);
				}
				return this.db.payout
					.update({
						where: { id: payout.id },
						data: {
							status,
							comments,
						},
					})
					.then((updated) => this.resultOk(updated));
			})
			.catch((error) => {
				this.logger.error(error);
				return this.resultFail(`Failed to update payout "${payoutId}": ${JSON.stringify(error)}`);
			});
	}
}
