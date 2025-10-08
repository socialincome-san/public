import { Contributor, ProgramPermission } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { ContributorTableView, ContributorTableViewRow, CreateContributorInput } from './contributor.types';

export class ContributorService extends BaseService {
	async create(input: CreateContributorInput): Promise<ServiceResult<Contributor>> {
		try {
			const contributor = await this.db.contributor.create({ data: input });
			return this.resultOk(contributor);
		} catch {
			return this.resultFail('Could not create contributor');
		}
	}

	async exists(accountId: string): Promise<boolean> {
		try {
			const existing = await this.db.contributor.findUnique({
				where: { accountId },
				select: { id: true },
			});
			return !!existing;
		} catch {
			return false;
		}
	}

	async getByAccountId(accountId: string): Promise<Contributor | null> {
		try {
			return await this.db.contributor.findUnique({ where: { accountId } });
		} catch {
			return null;
		}
	}

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
