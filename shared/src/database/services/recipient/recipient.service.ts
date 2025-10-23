import { PayoutStatus, ProgramPermission, Recipient } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { LocalPartnerUpdateInput } from '../local-partner/local-partner.types';
import { RecipientCreateInput, RecipientPayload, RecipientTableView, RecipientTableViewRow } from './recipient.types';

export class RecipientService extends BaseService {
	// TODO: check user permissions
	async create(recipient: RecipientCreateInput): Promise<ServiceResult<Recipient>> {
		try {
			const newRecipient = await this.db.recipient.create({ data: recipient });
			return this.resultOk(newRecipient);
		} catch {
			return this.resultFail('Could not create recipient');
		}
	}

	// TODO: check user permissions
	async update(recipient: LocalPartnerUpdateInput): Promise<ServiceResult<Recipient>> {
		try {
			const partner = await this.db.recipient.update({
				where: {
					id: recipient.id?.toString(),
				},
				data: recipient,
			});
			return this.resultOk(partner);
		} catch (e) {
			return this.resultFail('Could not update recipient: ' + e);
		}
	}

	async get(localPartnerId: string): Promise<ServiceResult<RecipientPayload>> {
		try {
			const partner = await this.db.recipient.findUnique({
				select: {
					id: true,
					status: true,
					startDate: true,
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
							gender: true,
							callingName: true,
							email: true,
							language: true,
							phone: true,
							profession: true,
							dateOfBirth: true,
							address: true,
						},
					},
				},
				where: { id: localPartnerId },
			});
			if (partner === null) return this.resultFail('Could not get local partner');
			return this.resultOk(partner);
		} catch (error) {
			return this.resultFail('Could not get local partner');
		}
	}

	async getRecipientTableView(userId: string): Promise<ServiceResult<RecipientTableView>> {
		try {
			const recipients = await this.db.recipient.findMany({
				where: {
					program: {
						accesses: {
							some: { userId },
						},
					},
				},
				orderBy: { createdAt: 'desc' },
				select: {
					id: true,
					status: true,
					program: {
						select: {
							id: true,
							name: true,
							totalPayments: true,
							accesses: {
								where: { userId },
								select: { permissions: true },
							},
						},
					},
					localPartner: {
						select: {
							name: true,
							contact: {
								select: {
									firstName: true,
									lastName: true,
								},
							},
						},
					},
					contact: {
						select: {
							firstName: true,
							lastName: true,
							dateOfBirth: true,
						},
					},
					payouts: {
						where: { status: { in: [PayoutStatus.paid, PayoutStatus.confirmed] } },
						select: { id: true },
					},
				},
			});

			const tableRows: RecipientTableViewRow[] = recipients.map((r) => {
				const payoutsReceived = r.payouts.length;
				const payoutsTotal = r.program?.totalPayments ?? 0;
				const payoutsProgressPercent = payoutsTotal > 0 ? Math.round((payoutsReceived / payoutsTotal) * 100) : 0;

				const birthDate = r.contact?.dateOfBirth ?? null;
				const age = birthDate ? this.calculateAgeFromBirthDate(birthDate) : null;

				const permissions = r.program?.accesses[0]?.permissions ?? [];
				const permission: ProgramPermission = permissions.includes(ProgramPermission.edit)
					? ProgramPermission.edit
					: ProgramPermission.readonly;

				const localPartnerName =
					r.localPartner?.name ??
					(r.localPartner?.contact ? `${r.localPartner.contact.firstName} ${r.localPartner.contact.lastName}` : '');

				return {
					id: r.id,
					firstName: r.contact?.firstName ?? '',
					lastName: r.contact?.lastName ?? '',
					age,
					status: r.status,
					payoutsReceived,
					payoutsTotal,
					payoutsProgressPercent,
					localPartnerName,
					programName: r.program?.name ?? '',
					programId: r.program?.id ?? '',
					permission,
				};
			});

			return this.resultOk({ tableRows });
		} catch {
			return this.resultFail('Could not fetch recipients');
		}
	}

	async getRecipientTableViewProgramScoped(
		userId: string,
		programId: string,
	): Promise<ServiceResult<RecipientTableView>> {
		const base = await this.getRecipientTableView(userId);
		if (!base.success) return base;

		const filteredRows = base.data.tableRows.filter((row) => row.programId === programId);
		return this.resultOk({ tableRows: filteredRows });
	}

	private calculateAgeFromBirthDate(birthDate: Date): number {
		const today = new Date();
		let years = today.getFullYear() - birthDate.getFullYear();
		const monthDiff = today.getMonth() - birthDate.getMonth();
		const dayDiff = today.getDate() - birthDate.getDate();
		if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) years -= 1;
		return years;
	}
}
