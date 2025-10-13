import { ProgramPermission } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { ContributorTableView, ContributorTableViewRow } from './contributor.types';

export class ContributorService extends BaseService {
	async getContributorTableView(userId: string): Promise<ServiceResult<ContributorTableView>> {
		try {
			const contributors = await this.db.contributor.findMany({
				where: {
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
				select: {
					id: true,
					createdAt: true,
					contact: {
						select: {
							firstName: true,
							lastName: true,
							email: true,
							address: { select: { country: true } },
						},
					},
					contributions: {
						select: {
							campaign: {
								select: {
									program: {
										select: {
											name: true,
											accesses: { where: { userId }, select: { permissions: true } },
										},
									},
								},
							},
						},
					},
				},
				orderBy: { createdAt: 'desc' },
			});

			const dateFmt = new Intl.DateTimeFormat('de-CH');
			const hiddenProgramLabel = '🔒 Restricted Program';

			const tableRows: ContributorTableViewRow[] = contributors.map((c) => {
				const renderedProgramNames = c.contributions
					.map((contribution) => {
						const program = contribution.campaign?.program;
						if (!program) return null;

						const canAccess = (program.accesses?.length ?? 0) > 0;
						return canAccess ? (program.name ?? '') : hiddenProgramLabel;
					})
					.filter((label): label is string => Boolean(label));

				// Keep program names unique and ordered
				const uniqueProgramNames: string[] = [];
				const seen = new Set<string>();
				for (const name of renderedProgramNames) {
					if (!seen.has(name)) {
						seen.add(name);
						uniqueProgramNames.push(name);
					}
				}

				const programName = uniqueProgramNames.join(', ');
				const isEditable = c.contributions.some((contribution) =>
					contribution.campaign?.program?.accesses?.some((a) => a.permissions.includes(ProgramPermission.edit)),
				);
				const permission: ProgramPermission = isEditable ? ProgramPermission.edit : ProgramPermission.readonly;

				return {
					id: c.id,
					firstName: c.contact?.firstName ?? '',
					lastName: c.contact?.lastName ?? '',
					email: c.contact?.email ?? '',
					country: c.contact?.address?.country ?? null,
					currency: null, // not in schema
					programName,
					createdAt: c.createdAt,
					createdAtFormatted: dateFmt.format(c.createdAt),
					permission,
				};
			});

			return this.resultOk({ tableRows });
		} catch {
			return this.resultFail('Could not fetch contributors');
		}
	}
}
