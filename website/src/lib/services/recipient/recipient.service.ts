import { ProgramPermission, Recipient, RecipientStatus } from '@prisma/client';
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

	async create(userId: string, recipient: RecipientCreateInput): Promise<ServiceResult<Recipient>> {
		const accessResult = await this.programAccessService.getAccessiblePrograms(userId);

		if (!accessResult.success) {
			return this.resultFail(accessResult.error);
		}

		const program = accessResult.data.find((a) => a.programId === recipient.program.connect?.id);

		if (!program || program.permission !== ProgramPermission.operator) {
			return this.resultFail('Permission denied');
		}

		try {
			const phoneNumber = recipient.paymentInformation?.create?.phone?.create?.number;
			if (!phoneNumber) {
				return this.resultFail('No phone number provided for recipient creation');
			}

			const firebaseResult = await this.firebaseService.createByPhoneNumber(phoneNumber);
			if (!firebaseResult.success) {
				return this.resultFail(`Failed to create Firebase user: ${firebaseResult.error}`);
			}

			const newRecipient = await this.db.recipient.create({ data: recipient });
			return this.resultOk(newRecipient);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail('Could not create recipient');
		}
	}

	async update(userId: string, recipient: RecipientPrismaUpdateInput): Promise<ServiceResult<Recipient>> {
		const accessResult = await this.programAccessService.getAccessiblePrograms(userId);

		if (!accessResult.success) {
			return this.resultFail(accessResult.error);
		}

		const program = accessResult.data.find((a) => a.programId === recipient.program?.connect?.id);

		if (!program || program.permission !== ProgramPermission.operator) {
			return this.resultFail('Permission denied');
		}

		const existing = await this.db.recipient.findUnique({
			where: { id: recipient.id?.toString() },
			select: { programId: true, paymentInformation: { select: { phone: { select: { number: true } } } } },
		});

		if (!existing) {
			return this.resultFail('Recipient not found');
		}

		const hasAccess = accessResult.data.some((a) => a.programId === existing.programId);

		if (!hasAccess) {
			return this.resultFail('Permission denied');
		}

		try {
			const phoneNumber =
				recipient.paymentInformation?.upsert?.update?.phone?.upsert?.update.number?.toString() ||
				recipient.paymentInformation?.upsert?.create?.phone?.create?.number?.toString();

			if (!phoneNumber || !existing.paymentInformation?.phone?.number) {
				return this.resultFail('No phone number available for recipient update');
			}

			if (existing.paymentInformation?.phone.number !== phoneNumber) {
				const firebaseResult = await this.firebaseService.updateByPhoneNumber(
					existing.paymentInformation?.phone.number,
					phoneNumber,
				);
				if (!firebaseResult.success) {
					return this.resultFail(`Failed to update Firebase user: ${firebaseResult.error}`);
				}
			}

			const updatedRecipient = await this.db.recipient.update({
				where: { id: recipient.id?.toString() },
				data: recipient,
			});
			return this.resultOk(updatedRecipient);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail('Could not update recipient: ' + error);
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
					program: true,
					localPartner: true,
				},
			});

			return this.resultOk(updatedRecipient);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail('Failed to update recipient');
		}
	}

	async get(userId: string, recipientId: string): Promise<ServiceResult<RecipientPayload>> {
		const accessResult = await this.programAccessService.getAccessiblePrograms(userId);

		if (!accessResult.success) {
			return this.resultFail(accessResult.error);
		}

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

		const hasAccess = accessResult.data.some((a) => a.programId === recipient.program.id);

		if (!hasAccess) {
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
							totalPayments: true,
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
				const access = accessiblePrograms.find((p) => p.programId === recipient.program?.id);
				const payoutsReceived = recipient.payouts.length;
				const payoutsTotal = recipient.program?.totalPayments ?? 0;
				const payoutsProgressPercent = payoutsTotal > 0 ? Math.round((payoutsReceived / payoutsTotal) * 100) : 0;

				return {
					id: recipient.id,
					firstName: recipient.contact?.firstName ?? '',
					lastName: recipient.contact?.lastName ?? '',
					dateOfBirth: recipient.contact?.dateOfBirth ?? null,
					localPartnerName: recipient.localPartner?.name ?? null,
					status: recipient.status ?? RecipientStatus.active,
					programId: recipient.program?.id ?? null,
					programName: recipient.program?.name ?? null,
					payoutsReceived,
					payoutsTotal,
					payoutsProgressPercent,
					createdAt: recipient.createdAt,
					permission: access?.permission ?? ProgramPermission.owner,
				};
			});

			const globalPermission = accessiblePrograms.some((p) => p.permission === ProgramPermission.operator)
				? ProgramPermission.operator
				: ProgramPermission.owner;

			return this.resultOk({ tableRows, permission: globalPermission });
		} catch (error) {
			this.logger.error(error);
			return this.resultFail('Could not fetch recipients');
		}
	}

	async getTableViewProgramScoped(userId: string, programId: string): Promise<ServiceResult<RecipientTableView>> {
		const accessResult = await this.programAccessService.getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return this.resultFail(accessResult.error);
		}
		const programAccess = accessResult.data.find((a) => a.programId === programId);

		const base = await this.getTableView(userId);
		if (!base.success) {
			return base;
		}

		const filteredRows = base.data.tableRows.filter((row) => row.programId === programId);
		return this.resultOk({
			tableRows: filteredRows,
			permission: programAccess?.permission ?? ProgramPermission.owner,
		});
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
							payoutAmount: true,
							payoutCurrency: true,
							totalPayments: true,
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

			const mapped: PayoutRecipient[] = recipients.map((r) => ({
				id: r.id,
				contact: r.contact,
				paymentInformation: r.paymentInformation,
				program: {
					payoutAmount: Number(r.program.payoutAmount),
					payoutCurrency: r.program.payoutCurrency,
					totalPayments: r.program.totalPayments,
				},
				payouts: r.payouts,
			}));

			return this.resultOk(mapped);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail('Could not fetch payout recipients');
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
			return this.resultFail('Could not get survey recipients');
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
					program: true,
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
			return this.resultFail('Could not find recipient by phone number');
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
