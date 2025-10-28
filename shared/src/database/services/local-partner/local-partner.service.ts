import { LocalPartner } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { UserService } from '../user/user.service';
import {
	LocalPartnerCreateInput,
	LocalPartnerOption,
	LocalPartnerPayload,
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
		} catch {
			return this.resultFail('Could not create local partner');
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
		} catch {
			return this.resultFail('Could not update local partner');
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
		} catch {
			return this.resultFail('Could not get local partner');
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
		} catch {
			return this.resultFail('Could not fetch local partners');
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
		} catch {
			return this.resultFail('Could not fetch local partners');
		}
	}
}
