import { ProgramPermission } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { DonationCertificateTableView, DonationCertificateTableViewRow } from './donation-certificate.types';

export class DonationCertificateService extends BaseService {
	async getDonationCertificateTableView(userId: string): Promise<ServiceResult<DonationCertificateTableView>> {
		try {
			const certificates = await this.db.donationCertificate.findMany({
				where: {
					contributor: {
						contributions: {
							some: {
								campaign: {
									program: {
										accesses: { some: { userId } },
									},
								},
							},
						},
					},
				},
				orderBy: { year: 'desc' },
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
							contributions: {
								select: {
									campaign: {
										select: {
											program: {
												select: {
													name: true,
													accesses: {
														where: { userId },
														select: { permissions: true },
													},
												},
											},
										},
									},
								},
							},
						},
					},
				},
			});

			const dateFmt = new Intl.DateTimeFormat('de-CH');
			const hiddenProgramLabel = '🔒 Restricted Program';

			const tableRows: DonationCertificateTableViewRow[] = certificates.map((cert) => {
				const contact = cert.contributor.contact;
				const contributions = cert.contributor.contributions;

				const renderedProgramNames = contributions
					.map((c) => {
						const program = c.campaign?.program;
						if (!program) return null;
						const canAccess = (program.accesses?.length ?? 0) > 0;
						return canAccess ? (program.name ?? '') : hiddenProgramLabel;
					})
					.filter((p): p is string => Boolean(p));

				const uniqueProgramNames: string[] = [];
				const seen = new Set<string>();
				for (const name of renderedProgramNames) {
					if (!seen.has(name)) {
						seen.add(name);
						uniqueProgramNames.push(name);
					}
				}

				const programName = uniqueProgramNames.join(', ') || '—';
				const isEditable = contributions.some((c) =>
					c.campaign?.program?.accesses?.some((a) => a.permissions.includes(ProgramPermission.edit)),
				);
				const permission = isEditable ? ProgramPermission.edit : ProgramPermission.readonly;

				return {
					id: cert.id,
					year: cert.year,
					contributorFirstName: contact.firstName ?? '',
					contributorLastName: contact.lastName ?? '',
					email: contact.email ?? null,
					programName,
					storagePath: cert.storagePath ?? null,
					createdAt: cert.createdAt,
					createdAtFormatted: dateFmt.format(cert.createdAt),
					permission,
				};
			});

			return this.resultOk({ tableRows });
		} catch (e) {
			console.error(e);
			return this.resultFail('Could not fetch donation certificates');
		}
	}
}
