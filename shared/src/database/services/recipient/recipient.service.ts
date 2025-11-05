import { ProgramPermission, Recipient, RecipientStatus } from '@prisma/client';
import { FirebaseService } from '@socialincome/shared/src/firebase/services/auth.service';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { ProgramAccessService } from '../program-access/program-access.service';
import {
	PayoutRecipient,
	RecipientCreateInput,
	RecipientOption,
	RecipientPayload,
	RecipientTableView,
	RecipientTableViewRow,
	RecipientUpdateInput,
} from './recipient.types';

export class RecipientService extends BaseService {
	private programAccessService = new ProgramAccessService();
	private firebaseAuthService = new FirebaseService();

	async create(userId: string, recipient: RecipientCreateInput): Promise<ServiceResult<Recipient>> {
		const accessResult = await this.programAccessService.getAccessiblePrograms(userId);

		if (!accessResult.success) {
			return this.resultFail(accessResult.error);
		}

		const hasAccess = accessResult.data.some((a) => a.programId === recipient.program.connect?.id);

		if (!hasAccess) {
			return this.resultFail('Permission denied');
		}

		try {
			const phoneNumber = recipient.paymentInformation?.create?.phone?.create?.number;
			if (!phoneNumber) {
				return this.resultFail('No phone number provided for recipient creation');
			}

			await this.firebaseAuthService.createByPhoneNumber(phoneNumber);
			const newRecipient = await this.db.recipient.create({ data: recipient });
			return this.resultOk(newRecipient);
		} catch (error) {
			console.error(error);
			return this.resultFail('Could not create recipient');
		}
	}

	async update(userId: string, recipient: RecipientUpdateInput): Promise<ServiceResult<Recipient>> {
		const accessResult = await this.programAccessService.getAccessiblePrograms(userId);

		if (!accessResult.success) {
			return this.resultFail(accessResult.error);
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

			await this.firebaseAuthService.updateByPhoneNumber(existing.paymentInformation?.phone.number, phoneNumber);
			const updatedRecipient = await this.db.recipient.update({
				where: { id: recipient.id?.toString() },
				data: recipient,
			});
			return this.resultOk(updatedRecipient);
		} catch (error) {
			console.error(error);
			return this.resultFail('Could not update recipient: ' + error);
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
				return this.resultOk({ tableRows: [] });
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
					permission: access?.permission ?? ProgramPermission.readonly,
				};
			});

			return this.resultOk({ tableRows });
		} catch (error) {
			console.error(error);
			return this.resultFail('Could not fetch recipients');
		}
	}

	async getTableViewProgramScoped(userId: string, programId: string): Promise<ServiceResult<RecipientTableView>> {
		const base = await this.getTableView(userId);
		if (!base.success) {
			return base;
		}

		const filteredRows = base.data.tableRows.filter((row) => row.programId === programId);
		return this.resultOk({ tableRows: filteredRows });
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
			console.error(error);
			return this.resultFail('Could not fetch payout recipients');
		}
	}

	async getEditableRecipientOptions(userId: string): Promise<ServiceResult<RecipientOption[]>> {
		const access = await this.programAccessService.getAccessiblePrograms(userId);

		if (!access.success) {
			return this.resultFail(access.error);
		}

		const editablePrograms = access.data.filter((p) => p.permission === ProgramPermission.edit).map((p) => p.programId);

		if (editablePrograms.length === 0) {
			return this.resultOk([]);
		}

		const recipients = await this.db.recipient.findMany({
			where: { programId: { in: editablePrograms } },
			select: {
				id: true,
				contact: { select: { firstName: true, lastName: true } },
				program: { select: { name: true } },
			},
			orderBy: [{ program: { name: 'asc' } }, { contact: { lastName: 'asc' } }],
		});

		const options = recipients.map((r) => ({
			id: r.id,
			fullName: `${r.contact.firstName} ${r.contact.lastName}`,
			programName: r.program.name,
		}));

		return this.resultOk(options);
	}
}
