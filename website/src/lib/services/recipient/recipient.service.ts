import { Actor } from '@/lib/firebase/current-account';
import { ProgramPermission, Recipient, RecipientStatus } from '@prisma/client';
import { AppReviewModeService } from '../app-review-mode/app-review-mode.service';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { FirebaseService } from '../firebase/firebase.service';
import { ProgramAccessService } from '../program-access/program-access.service';
import {
	PayoutRecipient,
	RecipientCreateInput,
	RecipientOption,
	RecipientPayload,
	RecipientPrismaUpdateInput,
	RecipientTableView,
	RecipientTableViewRow,
	RecipientWithPaymentInfo,
} from './recipient.types';

export class RecipientService extends BaseService {
	private programAccessService = new ProgramAccessService();
	private firebaseService = new FirebaseService();
	private appReviewModeService = new AppReviewModeService();

	async create(actor: Actor, recipient: RecipientCreateInput): Promise<ServiceResult<Recipient>> {
		const programId = recipient.program?.connect?.id;
		if (!programId) {
			return this.resultFail('No program specified for recipient creation');
		}

		if (actor.kind === 'user') {
			const userId = actor.session.id;

			const accessResult = await this.programAccessService.getAccessiblePrograms(userId);
			if (!accessResult.success) {
				return this.resultFail(accessResult.error);
			}

			const hasOperatorAccess = accessResult.data.some(
				(a) => a.programId === programId && a.permission === ProgramPermission.operator,
			);

			if (!hasOperatorAccess) {
				return this.resultFail('Permission denied');
			}
		}

		if (actor.kind === 'local-partner') {
			const partnerId = actor.session.id;

			recipient.localPartner = { connect: { id: partnerId } };
		}

		if (actor.kind === 'contributor') {
			return this.resultFail('Permission denied');
		}

		try {
			const phoneNumber = recipient.paymentInformation?.create?.phone?.create?.number;
			if (!phoneNumber) {
				return this.resultFail('No phone number provided for recipient creation');
			}

			return await this.db.$transaction(async (tx) => {
				const newRecipient = await tx.recipient.create({ data: recipient });

				const firebaseResult = await this.firebaseService.createByPhoneNumber(phoneNumber);
				if (!firebaseResult.success) {
					throw new Error(`Failed to create Firebase user: ${firebaseResult.error}`);
				}

				return this.resultOk(newRecipient);
			});
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not create recipient: ${JSON.stringify(error)}`);
		}
	}

	async update(
		actor: Actor,
		updateInput: RecipientPrismaUpdateInput,
		nextPaymentPhoneNumber: string | null,
	): Promise<ServiceResult<Recipient>> {
		const recipientId = updateInput.id as string;

		const existing = await this.db.recipient.findUnique({
			where: { id: recipientId },
			select: {
				programId: true,
				localPartnerId: true,
				paymentInformation: {
					select: {
						phone: { select: { number: true } },
					},
				},
			},
		});

		if (!existing) {
			return this.resultFail('Recipient not found');
		}

		if (actor.kind === 'user') {
			const userId = actor.session.id;
			const accessResult = await this.programAccessService.getAccessiblePrograms(userId);
			if (!accessResult.success) {
				return this.resultFail(accessResult.error);
			}

			const existingProgramAllowed = accessResult.data.some(
				(a) => a.programId === existing.programId && a.permission === ProgramPermission.operator,
			);
			if (!existingProgramAllowed) {
				return this.resultFail('Permission denied');
			}

			const requestedProgramId = updateInput.program?.connect?.id;
			if (requestedProgramId) {
				const requestedProgramAllowed = accessResult.data.some(
					(a) => a.programId === requestedProgramId && a.permission === ProgramPermission.operator,
				);
				if (!requestedProgramAllowed) {
					return this.resultFail('Permission denied');
				}
			}
		}

		if (actor.kind === 'local-partner') {
			const partnerId = actor.session.id;
			if (existing.localPartnerId !== partnerId) {
				return this.resultFail('Permission denied');
			}
			delete updateInput.localPartner;
			delete updateInput.program;
		}

		if (actor.kind === 'contributor') {
			return this.resultFail('Permission denied');
		}

		const previousPaymentPhoneNumber = existing.paymentInformation?.phone?.number ?? null;
		const paymentPhoneHasChanged =
			previousPaymentPhoneNumber !== null &&
			nextPaymentPhoneNumber !== null &&
			previousPaymentPhoneNumber !== nextPaymentPhoneNumber;

		try {
			if (paymentPhoneHasChanged) {
				const firebaseResult = await this.firebaseService.updateByPhoneNumber(
					previousPaymentPhoneNumber!,
					nextPaymentPhoneNumber!,
				);

				if (!firebaseResult.success) {
					return this.resultFail(`Failed to update Firebase user: ${firebaseResult.error}`);
				}
			}

			const updatedRecipient = await this.db.recipient.update({
				where: { id: recipientId },
				data: updateInput,
			});

			return this.resultOk(updatedRecipient);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not update recipient: ${JSON.stringify(error)}`);
		}
	}

	async updateSelf(
		recipientId: string,
		data: RecipientPrismaUpdateInput,
		options: {
			oldPaymentPhone: string | null;
			newPaymentPhone: string | null;
		},
	): Promise<ServiceResult<RecipientWithPaymentInfo>> {
		try {
			const phoneChanged =
				options.oldPaymentPhone && options.newPaymentPhone && options.oldPaymentPhone !== options.newPaymentPhone;

			if (phoneChanged) {
				const firebaseResult = await this.firebaseService.updateByPhoneNumber(
					options.oldPaymentPhone!,
					options.newPaymentPhone!,
				);

				if (!firebaseResult.success) {
					return this.resultFail(`Failed to update Firebase phone number: ${firebaseResult.error}`);
				}
			}

			const updatedRecipient = await this.db.recipient.update({
				where: { id: recipientId },
				data,
				include: {
					contact: { include: { phone: true } },
					paymentInformation: { include: { phone: true } },
					program: {
						include: {
							country: {
								select: {
									isoCode: true,
								},
							},
						},
					},
					localPartner: true,
				},
			});

			return this.resultOk(updatedRecipient);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Failed to update recipient: ${JSON.stringify(error)}`);
		}
	}

	async get(actor: Actor, recipientId: string): Promise<ServiceResult<RecipientPayload>> {
		const recipient = await this.db.recipient.findUnique({
			where: { id: recipientId },
			select: {
				id: true,
				startDate: true,
				status: true,
				successorName: true,
				termsAccepted: true,
				localPartner: {
					select: {
						id: true,
						name: true,
					},
				},
				program: {
					select: {
						id: true,
						name: true,
					},
				},
				contact: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						callingName: true,
						email: true,
						gender: true,
						language: true,
						dateOfBirth: true,
						profession: true,
						phone: true,
						address: true,
					},
				},
				paymentInformation: {
					select: {
						id: true,
						code: true,
						provider: true,
						phone: true,
					},
				},
			},
		});

		if (!recipient) {
			return this.resultFail('Recipient not found');
		}

		if (actor.kind === 'user') {
			const userId = actor.session.id;
			const accessResult = await this.programAccessService.getAccessiblePrograms(userId);
			if (!accessResult.success) {
				return this.resultFail(accessResult.error);
			}
			const hasAccess = accessResult.data.some((a) => a.programId === recipient.program?.id);
			if (!hasAccess) {
				return this.resultFail('Permission denied');
			}
		}

		if (actor.kind === 'local-partner') {
			const partnerId = actor.session.id;
			if (recipient.localPartner?.id !== partnerId) {
				return this.resultFail('Permission denied');
			}
		}

		if (actor.kind === 'contributor') {
			return this.resultFail('Permission denied');
		}

		return this.resultOk(recipient);
	}

	async getTableView(userId: string): Promise<ServiceResult<RecipientTableView>> {
		try {
			const accessResult = await this.programAccessService.getAccessiblePrograms(userId);
			if (!accessResult.success) {
				return this.resultFail(accessResult.error);
			}

			const accessiblePrograms = accessResult.data;
			if (accessiblePrograms.length === 0) {
				return this.resultOk({ tableRows: [], permission: ProgramPermission.owner });
			}

			const programIds = accessiblePrograms.map((p) => p.programId);

			const recipients = await this.db.recipient.findMany({
				where: {
					programId: { in: programIds },
				},
				select: {
					id: true,
					status: true,
					contact: {
						select: {
							firstName: true,
							lastName: true,
							dateOfBirth: true,
						},
					},
					program: {
						select: {
							id: true,
							name: true,
							programDurationInMonths: true,
						},
					},
					localPartner: {
						select: { name: true },
					},
					payouts: {
						select: { id: true },
					},
					createdAt: true,
				},
				orderBy: { createdAt: 'desc' },
			});

			const tableRows: RecipientTableViewRow[] = recipients.map((recipient) => {
				const programPermissions = accessiblePrograms
					.filter((p) => p.programId === recipient.program?.id)
					.map((p) => p.permission);

				const permission = programPermissions.includes(ProgramPermission.operator)
					? ProgramPermission.operator
					: ProgramPermission.owner;

				const payoutsReceived = recipient.payouts.length;
				const payoutsTotal = recipient.program?.programDurationInMonths ?? 0;
				const payoutsProgressPercent = payoutsTotal > 0 ? Math.round((payoutsReceived / payoutsTotal) * 100) : 0;

				return {
					id: recipient.id,
					firstName: recipient.contact?.firstName ?? '',
					lastName: recipient.contact?.lastName ?? '',
					dateOfBirth: recipient.contact?.dateOfBirth ?? null,
					localPartnerName: recipient.localPartner?.name ?? null,
					status: recipient.status,
					programId: recipient.program?.id ?? null,
					programName: recipient.program?.name ?? null,
					payoutsReceived,
					payoutsTotal,
					payoutsProgressPercent,
					createdAt: recipient.createdAt,
					permission,
				};
			});

			const globalPermission = accessiblePrograms.some((p) => p.permission === ProgramPermission.operator)
				? ProgramPermission.operator
				: ProgramPermission.owner;

			return this.resultOk({ tableRows, permission: globalPermission });
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch recipients: ${JSON.stringify(error)}`);
		}
	}

	async getTableViewProgramScoped(userId: string, programId: string): Promise<ServiceResult<RecipientTableView>> {
		const accessResult = await this.programAccessService.getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return this.resultFail(accessResult.error);
		}

		const permission = accessResult.data.some(
			(a) => a.programId === programId && a.permission === ProgramPermission.operator,
		)
			? ProgramPermission.operator
			: ProgramPermission.owner;

		const base = await this.getTableView(userId);
		if (!base.success) {
			return base;
		}

		const filteredRows = base.data.tableRows.filter((row) => row.programId === programId);

		return this.resultOk({
			tableRows: filteredRows,
			permission,
		});
	}

	async getTableViewByLocalPartnerId(localPartnerId: string): Promise<ServiceResult<RecipientTableView>> {
		try {
			const recipients = await this.db.recipient.findMany({
				where: {
					localPartnerId,
					programId: { not: null },
				},
				select: {
					id: true,
					status: true,
					contact: {
						select: {
							firstName: true,
							lastName: true,
							dateOfBirth: true,
						},
					},
					program: {
						select: {
							id: true,
							name: true,
							programDurationInMonths: true,
						},
					},
					payouts: {
						select: { id: true },
					},
					createdAt: true,
				},
				orderBy: { createdAt: 'desc' },
			});

			const tableRows: RecipientTableViewRow[] = recipients.map((r) => {
				const payoutsReceived = r.payouts.length;
				const payoutsTotal = r.program?.programDurationInMonths ?? 0;
				const payoutsProgressPercent = payoutsTotal > 0 ? Math.round((payoutsReceived / payoutsTotal) * 100) : 0;

				return {
					id: r.id,
					firstName: r.contact?.firstName ?? '',
					lastName: r.contact?.lastName ?? '',
					dateOfBirth: r.contact?.dateOfBirth ?? null,
					localPartnerName: null,
					status: r.status,
					programId: r.program?.id ?? null,
					programName: r.program?.name ?? null,
					payoutsReceived,
					payoutsTotal,
					payoutsProgressPercent,
					createdAt: r.createdAt,
					permission: ProgramPermission.operator,
				};
			});

			return this.resultOk({
				tableRows,
				permission: ProgramPermission.operator,
			});
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch recipients for local partner: ${JSON.stringify(error)}`);
		}
	}

	async getActivePayoutRecipients(userId: string): Promise<ServiceResult<PayoutRecipient[]>> {
		try {
			const accessResult = await this.programAccessService.getAccessiblePrograms(userId);

			if (!accessResult.success) {
				return this.resultFail(accessResult.error);
			}

			const accessiblePrograms = accessResult.data;
			if (accessiblePrograms.length === 0) {
				return this.resultFail('No accessible programs found');
			}

			const programIds = accessiblePrograms.map((p) => p.programId);

			const recipients = await this.db.recipient.findMany({
				where: {
					programId: { in: programIds },
					status: RecipientStatus.active,
				},
				select: {
					id: true,
					contact: {
						select: {
							firstName: true,
							lastName: true,
						},
					},
					paymentInformation: {
						select: {
							code: true,
							phone: { select: { number: true } },
						},
					},
					program: {
						select: {
							payoutPerInterval: true,
							payoutCurrency: true,
							programDurationInMonths: true,
						},
					},
					payouts: {
						select: {
							paymentAt: true,
							status: true,
						},
					},
				},
				orderBy: {
					paymentInformation: { code: 'asc' },
				},
			});

			const mapped: PayoutRecipient[] = recipients
				.filter((r) => r.program !== null)
				.map((r) => ({
					id: r.id,
					contact: r.contact,
					paymentInformation: r.paymentInformation,
					program: {
						payoutPerInterval: Number(r.program!.payoutPerInterval),
						payoutCurrency: r.program!.payoutCurrency,
						programDurationInMonths: r.program!.programDurationInMonths,
					},
					payouts: r.payouts,
				}));

			return this.resultOk(mapped);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch payout recipients: ${JSON.stringify(error)}`);
		}
	}

	async getEditableRecipientOptions(userId: string): Promise<ServiceResult<RecipientOption[]>> {
		const access = await this.programAccessService.getAccessiblePrograms(userId);

		if (!access.success) {
			return this.resultFail(access.error);
		}

		const editablePrograms = access.data
			.filter((p) => p.permission === ProgramPermission.operator)
			.map((p) => p.programId);

		if (editablePrograms.length === 0) {
			return this.resultOk([]);
		}

		const recipients = await this.db.recipient.findMany({
			where: { programId: { in: editablePrograms } },
			select: {
				id: true,
				contact: { select: { firstName: true, lastName: true } },
			},
			orderBy: [{ contact: { firstName: 'asc' } }],
		});

		const options = recipients.map((r) => ({
			id: r.id,
			fullName: `${r.contact.firstName} ${r.contact.lastName}`,
		}));

		return this.resultOk(options);
	}

	async getSurveyRecipients(programIds: string[]) {
		try {
			const recipients = await this.db.recipient.findMany({
				where: {
					programId: { in: programIds },
					status: { not: RecipientStatus.waitlisted },
					startDate: { not: null },
				},
				select: {
					id: true,
					programId: true,
					startDate: true,
					contact: {
						select: {
							firstName: true,
							lastName: true,
						},
					},
					program: {
						select: {
							name: true,
						},
					},
				},
			});

			return this.resultOk(recipients);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not get survey recipients: ${JSON.stringify(error)}`);
		}
	}

	async getByPaymentPhoneNumber(phoneNumber: string): Promise<ServiceResult<RecipientWithPaymentInfo | null>> {
		try {
			const recipient = await this.db.recipient.findFirst({
				where: {
					paymentInformation: {
						phone: {
							number: phoneNumber,
						},
					},
				},
				include: {
					contact: {
						include: {
							phone: true,
						},
					},
					paymentInformation: {
						include: {
							phone: true,
						},
					},
					program: {
						include: {
							country: {
								select: {
									isoCode: true,
								},
							},
						},
					},
					localPartner: {
						include: {
							contact: {
								include: {
									phone: true,
								},
							},
						},
					},
				},
			});

			return this.resultOk(recipient);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not find recipient by phone number: ${JSON.stringify(error)}`);
		}
	}

	async getRecipientFromRequest(request: Request): Promise<ServiceResult<RecipientWithPaymentInfo>> {
		const tokenResult = await this.firebaseService.getDecodedTokenFromRequest(request);
		if (!tokenResult.success) {
			return this.resultFail(tokenResult.error, 401);
		}

		const phone = this.firebaseService.getPhoneFromToken(tokenResult.data);
		if (!phone) {
			return this.resultFail('Phone number not present in token', 400);
		}

		if (this.appReviewModeService.shouldBypass(phone)) {
			const mockResult = this.appReviewModeService.getMockRecipient(phone);
			if (mockResult.success) {
				return mockResult;
			}
			return this.resultFail(mockResult.error ?? 'Could not create mock recipient');
		}

		const recipientResult = await this.getByPaymentPhoneNumber(phone);
		if (!recipientResult.success) {
			return this.resultFail(recipientResult.error, 500);
		}

		if (!recipientResult.data) {
			return this.resultFail(`No recipient found for phone "${phone.slice(0, 2)}****${phone.slice(-2)}"`, 404);
		}

		return this.resultOk(recipientResult.data);
	}
}
