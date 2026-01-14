import { LocalPartner } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { UserService } from '../user/user.service';
import {
	LocalPartnerCreateInput,
	LocalPartnerOption,
	LocalPartnerPayload,
	LocalPartnerSession,
	LocalPartnerTableView,
	LocalPartnerTableViewRow,
	LocalPartnerUpdateInput,
} from './local-partner.types';

export class LocalPartnerService extends BaseService {
	private userService = new UserService();

	async create(userId: string, localPartner: LocalPartnerCreateInput): Promise<ServiceResult<LocalPartner>> {
		const isAdminResult = await this.userService.isAdmin(userId);

		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		try {
			const partner = await this.db.localPartner.create({ data: localPartner });
			return this.resultOk(partner);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not create local partner: ${JSON.stringify(error)}`);
		}
	}

	async update(userId: string, localPartner: LocalPartnerUpdateInput): Promise<ServiceResult<LocalPartner>> {
		const isAdminResult = await this.userService.isAdmin(userId);

		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		try {
			const partner = await this.db.localPartner.update({
				where: { id: localPartner.id?.toString() },
				data: localPartner,
			});

			return this.resultOk(partner);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not update local partner: ${JSON.stringify(error)}`);
		}
	}

	async get(userId: string, localPartnerId: string): Promise<ServiceResult<LocalPartnerPayload>> {
		const isAdminResult = await this.userService.isAdmin(userId);

		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		try {
			const partner = await this.db.localPartner.findUnique({
				where: { id: localPartnerId },
				select: {
					id: true,
					name: true,
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
			});

			if (!partner) {
				return this.resultFail('Could not get local partner');
			}

			return this.resultOk(partner);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not get local partner: ${JSON.stringify(error)}`);
		}
	}

	async getTableView(userId: string): Promise<ServiceResult<LocalPartnerTableView>> {
		const isAdminResult = await this.userService.isAdmin(userId);

		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		try {
			const partners = await this.db.localPartner.findMany({
				select: {
					id: true,
					name: true,
					createdAt: true,
					contact: {
						select: {
							firstName: true,
							lastName: true,
							phone: { select: { number: true } },
						},
					},
					_count: { select: { recipients: true } },
				},
				orderBy: { name: 'asc' },
			});

			const tableRows: LocalPartnerTableViewRow[] = partners.map((partner) => ({
				id: partner.id,
				name: partner.name,
				contactPerson: `${partner.contact?.firstName ?? ''} ${partner.contact?.lastName ?? ''}`.trim(),
				contactNumber: partner.contact?.phone?.number ?? null,
				recipientsCount: partner._count.recipients,
				createdAt: partner.createdAt,
			}));

			return this.resultOk({ tableRows });
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch local partners: ${JSON.stringify(error)}`);
		}
	}

	async getOptions(): Promise<ServiceResult<LocalPartnerOption[]>> {
		try {
			const partners = await this.db.localPartner.findMany({
				select: {
					id: true,
					name: true,
				},
				orderBy: { name: 'asc' },
			});

			return this.resultOk(partners);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch local partners: ${JSON.stringify(error)}`);
		}
	}

	async getCurrentLocalPartnerSession(firebaseAuthUserId: string): Promise<ServiceResult<LocalPartnerSession>> {
		try {
			const partner = await this.db.localPartner.findFirst({
				where: { account: { firebaseAuthUserId } },
				select: {
					id: true,
					name: true,
					causes: true,
					contact: {
						select: {
							firstName: true,
							lastName: true,
							language: true,
							email: true,
							phone: {
								select: { number: true },
							},
							address: {
								select: {
									country: true,
								},
							},
						},
					},
				},
			});

			if (!partner) {
				return this.resultFail('Local partner not found');
			}

			const session: LocalPartnerSession = {
				id: partner.id,
				name: partner.name,
				causes: partner.causes,
				email: partner.contact?.email ?? null,
				firstName: partner.contact?.firstName ?? null,
				lastName: partner.contact?.lastName ?? null,
				language: partner.contact?.language ?? null,
				phone: partner.contact?.phone?.number ?? null,
				country: partner.contact?.address?.country ?? null,
			};

			return this.resultOk(session);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch local partner session: ${JSON.stringify(error)}`);
		}
	}
}
