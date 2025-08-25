import { LocalPartner, User as PrismaUser } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { CreateLocalPartnerInput, LocalPartnerTableView, LocalPartnerTableViewRow } from './local-partner.types';

export class LocalPartnerService extends BaseService {
	async create(input: CreateLocalPartnerInput): Promise<ServiceResult<LocalPartner>> {
		try {
			const partner = await this.db.localPartner.create({
				data: input,
			});
			return this.resultOk(partner);
		} catch (e) {
			console.error('[LocalPartnerService.create]', e);
			return this.resultFail('Could not create local partner');
		}
	}

	async findByName(name: string): Promise<LocalPartner | null> {
		try {
			return await this.db.localPartner.findUnique({
				where: { name },
			});
		} catch (e) {
			console.error(`[LocalPartnerService.findByName] Failed to find local partner with name "${name}"`, e);
			return null;
		}
	}

	async getLocalPartnerTableView(user: PrismaUser): Promise<ServiceResult<LocalPartnerTableView>> {
		const accessDenied = this.requireGlobalAnalystOrAdmin<LocalPartnerTableView>(user);
		if (accessDenied) return accessDenied;

		try {
			const partners = await this.db.localPartner.findMany({
				select: {
					id: true,
					name: true,
					user: {
						select: {
							firstName: true,
							lastName: true,
							communicationPhone: true,
							phone: true,
						},
					},
					_count: { select: { recipients: true } },
				},
				orderBy: { name: 'asc' },
			});

			const rows: LocalPartnerTableViewRow[] = partners.map((localPartner) => {
				const contactPerson = [localPartner.user?.firstName, localPartner.user?.lastName].filter(Boolean).join(' ');
				const contactNumber = localPartner.user?.communicationPhone ?? localPartner.user?.phone ?? null;

				return {
					id: localPartner.id,
					name: localPartner.name,
					contactPerson,
					contactNumber,
					recipientsCount: localPartner._count.recipients,
					readonly: user.role === 'globalAnalyst',
				};
			});

			return this.resultOk({ tableRows: rows });
		} catch (error) {
			console.error('[LocalPartnerService.getLocalPartnerTableView]', error);
			return this.resultFail('Could not fetch local partners');
		}
	}
}
