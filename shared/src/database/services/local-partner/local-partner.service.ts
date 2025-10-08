import { LocalPartner, Prisma, UserRole } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { LocalPartnerPayload, LocalPartnerTableView, LocalPartnerTableViewRow } from './local-partner.types';

export class LocalPartnerService extends BaseService {
	async create(input: Prisma.LocalPartnerCreateInput): Promise<ServiceResult<LocalPartner>> {
		try {
			const partner = await this.db.localPartner.create({ data: input });
			return this.resultOk(partner);
		} catch (error) {
			return this.resultFail('Could not create local partner');
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
							firstName: true,
							lastName: true,
							gender: true,
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

			const tableRows: LocalPartnerTableViewRow[] = partners.map((p) => ({
				id: p.id,
				name: p.name,
				contactPerson: `${p.contact?.firstName ?? ''} ${p.contact?.lastName ?? ''}`.trim(),
				contactNumber: p.contact?.phone?.number ?? null,
				recipientsCount: p._count.recipients,
			}));

			return this.resultOk({ tableRows });
		} catch (error) {
			console.error('[LocalPartnerService.getTableView]', error);
			return this.resultFail('Could not fetch local partners');
		}
	}
}
