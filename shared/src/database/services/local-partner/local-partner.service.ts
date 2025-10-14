import { UserRole } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { LocalPartnerTableView, LocalPartnerTableViewRow } from './local-partner.types';

export class LocalPartnerService extends BaseService {
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
			return this.resultFail('Could not fetch local partners');
		}
	}
}
