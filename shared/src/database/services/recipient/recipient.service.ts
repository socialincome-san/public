import { PayoutStatus, Recipient as PrismaRecipient, RecipientStatus } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { PaginationOptions, ServiceResult } from '../core/base.types';
import {
	CreateRecipientInput,
	ProgramPermission,
	RecipientTableView,
	RecipientTableViewRow,
	RecipientWithPayouts,
} from './recipient.types';

export class RecipientService extends BaseService {
	async findMany(options?: PaginationOptions): Promise<ServiceResult<PrismaRecipient[]>> {
		try {
			const recipients = await this.db.recipient.findMany({
				orderBy: { createdAt: 'desc' },
				...options,
			});

			return this.resultOk(recipients);
		} catch (e) {
			console.error('[RecipientService.findMany]', e);
			return this.resultFail('Could not fetch recipients');
		}
	}

	async create(input: CreateRecipientInput): Promise<ServiceResult<PrismaRecipient>> {
		try {
			const recipient = await this.db.recipient.create({ data: input });
			return this.resultOk(recipient);
		} catch (e) {
			console.error('[RecipientService.create]', e);
			return this.resultFail('Could not create recipient');
		}
	}

	async getRecipientTableView(userId: string): Promise<ServiceResult<RecipientTableView>> {
		try {
			const recipients = await this.db.recipient.findMany({
				where: { program: this.userAccessibleProgramsWhere(userId) },
				orderBy: { createdAt: 'desc' },
				select: {
					id: true,
					status: true,
					localPartner: { select: { name: true } },
					user: {
						select: {
							firstName: true,
							lastName: true,
							birthDate: true,
							gender: true,
							omUid: true,
							language: true,
							organizationId: true,
							mobileMoneyPhone: true,
							mobileMoneyPhoneHasWhatsApp: true,
							communicationPhone: true,
							communicationPhoneHasWhatsApp: true,
							communicationPhoneWhatsappActivated: true,
							profession: true,
							email: true,
							instaHandle: true,
							twitterHandle: true,
							callingName: true,
						},
					},
					program: {
						select: {
							id: true,
							name: true,
							totalPayments: true,
							operatorOrganization: {
								select: { users: { where: { id: userId }, select: { id: true }, take: 1 } },
							},
							viewerOrganization: {
								select: { users: { where: { id: userId }, select: { id: true }, take: 1 } },
							},
						},
					},
					payouts: {
						where: { status: { in: [PayoutStatus.paid, PayoutStatus.confirmed] } },
						select: { id: true },
					},
				},
			});

			const tableRows: RecipientTableViewRow[] = recipients.map((recipient) => {
				const payoutsReceived = recipient.payouts.length;
				const payoutsTotal = recipient.program?.totalPayments ?? 0;
				const payoutsProgressPercent = payoutsTotal > 0 ? Math.round((payoutsReceived / payoutsTotal) * 100) : 0;
				const userIsOperator = (recipient.program?.operatorOrganization?.users?.length ?? 0) > 0;
				const permission: ProgramPermission = userIsOperator ? 'operator' : 'viewer';

				return {
					id: recipient.id,
					firstName: recipient.user?.firstName ?? '',
					lastName: recipient.user?.lastName ?? '',
					status: recipient.status as RecipientStatus,
					payoutsReceived,
					payoutsTotal,
					payoutsProgressPercent,
					localPartnerName: recipient.localPartner?.name ?? '',
					programName: recipient.program?.name ?? '',
					programId: recipient.program?.id ?? '',
					permission,

					omUid: recipient.user?.omUid ? recipient.user.omUid.toString() : '',
					organizationId: recipient.user?.organizationId ?? '',
					mobileMoneyPhone: recipient.user?.mobileMoneyPhone ?? '',
					mobileMoneyPhoneHasWhatsApp: recipient.user?.mobileMoneyPhoneHasWhatsApp ?? false,
					communicationPhone: recipient.user?.communicationPhone ?? '',
					communicationPhoneHasWhatsApp: recipient.user?.communicationPhoneHasWhatsApp ?? false,
					communicationPhoneHasWhatsAppActivated: recipient.user?.communicationPhoneWhatsappActivated ?? false,
					gender: recipient.user?.gender ?? '',
					language: recipient.user?.language ?? '',
					profession: recipient.user?.profession ?? '',
					email: recipient.user?.email ?? '',
					instaHandle: recipient.user?.instaHandle ?? '',
					twitterHandle: recipient.user?.twitterHandle ?? '',
					birthDate: recipient.user?.birthDate ?? new Date(0),
					callingName: recipient.user?.callingName ?? '',
				};
			});

			return this.resultOk({ tableRows });
		} catch (error) {
			console.error('[RecipientService.getRecipientTableView]', error);
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

	async getRecipientByMobileMoneyPhone(mobileMoneyPhone: string): Promise<ServiceResult<RecipientWithPayouts | null>> {
		try {
			const recipient = await this.db.recipient.findFirst({
				where: { user: { mobileMoneyPhone } },
				include: { payouts: true },
			});
			return this.resultOk(recipient);
		} catch (e) {
			console.error('[RecipientService.getRecipientByMobileMoneyPhone]', { mobileMoneyPhone, error: e });
			return this.resultFail(`Could not fetch recipient for phone ${mobileMoneyPhone}`);
		}
	}
}
