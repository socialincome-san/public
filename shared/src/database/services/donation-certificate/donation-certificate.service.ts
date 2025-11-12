import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { OrganizationAccessService } from '../organization-access/organization-access.service';
import { DonationCertificateTableView, DonationCertificateTableViewRow } from './donation-certificate.types';
export class DonationCertificateService extends BaseService {
	private organizationAccessService = new OrganizationAccessService();

	async getTableView(userId: string): Promise<ServiceResult<DonationCertificateTableView>> {
		try {
			const activeOrgResult = await this.organizationAccessService.getActiveOrganizationAccess(userId);
			if (!activeOrgResult.success) {
				return this.resultFail(activeOrgResult.error);
			}

			const { id: organizationId, permission } = activeOrgResult.data;

			const certificates = await this.db.donationCertificate.findMany({
				where: {
					contributor: {
						contributions: {
							some: {
								campaign: { organizationId },
							},
						},
					},
				},
				select: {
					id: true,
					year: true,
					storagePath: true,
					createdAt: true,
					contributor: {
						select: {
							contact: {
								select: {
									firstName: true,
									lastName: true,
									email: true,
								},
							},
						},
					},
				},
				orderBy: { createdAt: 'desc' },
			});

			const tableRows: DonationCertificateTableViewRow[] = certificates.map((c) => ({
				id: c.id,
				year: c.year,
				contributorFirstName: c.contributor.contact?.firstName ?? '',
				contributorLastName: c.contributor.contact?.lastName ?? '',
				email: c.contributor.contact?.email ?? '',
				storagePath: c.storagePath,
				createdAt: c.createdAt,
				permission,
			}));

			return this.resultOk({ tableRows });
		} catch (error) {
			this.logger.error(error);
			return this.resultFail('Could not fetch donation certificates');
		}
	}
}
