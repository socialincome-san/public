import { PayoutStatus, PrismaClient } from '@/generated/prisma/client';
import { ProgramPermission } from '@/generated/prisma/enums';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { ProgramAccessReadService } from '../program-access/program-access-read.service';
import { PayoutFormCreateInput, PayoutFormUpdateInput } from './payout-form-input';
import { PayoutValidationService } from './payout-validation.service';
import { PayoutEntity, PayoutPayload } from './payout.types';

export class PayoutWriteService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly programAccessService: ProgramAccessReadService,
		private readonly payoutValidationService: PayoutValidationService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

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

	async create(userId: string, input: PayoutFormCreateInput): Promise<ServiceResult<PayoutPayload>> {
		const validatedInputResult = this.payoutValidationService.validateCreateInput(input);
		if (!validatedInputResult.success) {
			return this.resultFail(validatedInputResult.error);
		}
		const validatedInput = validatedInputResult.data;

		try {
			const recipient = await this.db.recipient.findUnique({
				where: { id: validatedInput.recipientId },
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

			const created = await this.db.payout.create({
				data: {
					recipient: { connect: { id: validatedInput.recipientId } },
					amount: validatedInput.amount,
					currency: validatedInput.currency,
					status: validatedInput.status,
					paymentAt: validatedInput.paymentAt,
					phoneNumber: validatedInput.phoneNumber,
					comments: validatedInput.comments,
				},
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
					programId: created.recipient.program?.id ?? null,
					programName: created.recipient.program?.name ?? null,
				},
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not create payout: ${JSON.stringify(error)}`);
		}
	}

	async update(userId: string, input: PayoutFormUpdateInput): Promise<ServiceResult<PayoutPayload>> {
		const validatedInputResult = this.payoutValidationService.validateUpdateInput(input);
		if (!validatedInputResult.success) {
			return this.resultFail(validatedInputResult.error);
		}
		const validatedInput = validatedInputResult.data;

		try {
			const existing = await this.db.payout.findUnique({
				where: { id: validatedInput.id },
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

			const targetRecipient = await this.db.recipient.findUnique({
				where: { id: validatedInput.recipientId },
				select: { programId: true },
			});
			if (!targetRecipient) {
				return this.resultFail('Recipient not found');
			}
			if (targetRecipient.programId) {
				const access = await this.programAccessService.getAccessiblePrograms(userId);
				if (!access.success) {
					return this.resultFail(access.error);
				}
				const canEditTarget = access.data.some(
					(p) => p.programId === targetRecipient.programId && p.permission === ProgramPermission.operator,
				);
				if (!canEditTarget) {
					return this.resultFail('No edit access for selected recipient');
				}
			}

			const updated = await this.db.payout.update({
				where: { id: validatedInput.id },
				data: {
					amount: validatedInput.amount,
					currency: validatedInput.currency,
					status: validatedInput.status,
					paymentAt: validatedInput.paymentAt,
					phoneNumber: validatedInput.phoneNumber,
					comments: validatedInput.comments,
					recipient: { connect: { id: validatedInput.recipientId } },
				},
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
					programId: updated.recipient.program?.id ?? null,
					programName: updated.recipient.program?.name ?? null,
				},
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not update payout: ${JSON.stringify(error)}`);
		}
	}

	async updateStatusByRecipient(
		recipientId: string,
		payoutId: string,
		status: PayoutStatus,
		comments?: string | null,
	): Promise<ServiceResult<PayoutEntity>> {
		try {
			const payout = await this.db.payout.findFirst({ where: { id: payoutId, recipientId } });
			if (!payout) {
				return this.resultFail(`Payout "${payoutId}" not found for recipient`);
			}
			const updated = await this.db.payout.update({
				where: { id: payout.id },
				data: {
					status,
					comments,
				},
			});

			return this.resultOk(updated);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Failed to update payout "${payoutId}": ${JSON.stringify(error)}`);
		}
	}
}
