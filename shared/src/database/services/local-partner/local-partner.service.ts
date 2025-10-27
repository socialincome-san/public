import { LocalPartner, UserRole } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import {
	LocalPartnerCreateInput,
	LocalPartnerPayload,
	LocalPartnerTableView,
	LocalPartnerTableViewRow,
	LocalPartnerUpdateInput,
} from './local-partner.types';

export class LocalPartnerService extends BaseService {
	// TODO: check user permissions
	async create(localPartner: LocalPartnerCreateInput): Promise<ServiceResult<LocalPartner>> {
		try {
			const partner = await this.db.localPartner.create({ data: localPartner });
			return this.resultOk(partner);
		} catch {
			return this.resultFail('Could not create local partner');
		}
	}

	// TODO: check user permissions
	async update(localPartner: LocalPartnerUpdateInput): Promise<ServiceResult<LocalPartner>> {
		try {
			const partner = await this.db.localPartner.update({
				where: {
					id: localPartner.id?.toString(),
				},
				data: localPartner,
			});
			return this.resultOk(partner);
		} catch (e) {
			return this.resultFail('Could not update local partner: ' + e);
		}
	}

	async get(localPartnerId: string): Promise<ServiceResult<LocalPartnerPayload>> {
		try {
			const partner = await this.db.localPartner.findUnique({
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
				where: { id: localPartnerId },
			});
			if (partner === null) return this.resultFail('Could not get local partner');
			return this.resultOk(partner);
		} catch (error) {
			return this.resultFail('Could not get local partner');
		}
	}

	async getTableView(userId: string): Promise<ServiceResult<LocalPartnerTableView>> {
		try {
			const user = await this.db.user.findUnique({
				where: { id: userId },
				select: { role: true },
			});

			if (!user || user.role !== UserRole.admin) {
				return this.resultOk({ tableRows: [] });
			}

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
}
