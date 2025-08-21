import { Contributor as PrismaContributor } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import {
	ContributorTableView,
	ContributorTableViewRow,
	CreateContributorInput,
	ProgramPermission,
} from './contributor.types';

export class ContributorService extends BaseService {
	async create(input: CreateContributorInput): Promise<ServiceResult<PrismaContributor>> {
		try {
			const contributor = await this.db.contributor.create({ data: input });
			return this.resultOk(contributor);
		} catch (error) {
			console.error('[ContributorService.create]', error);
			return this.resultFail('Could not create contributor');
		}
	}

	async exists(userId: string): Promise<boolean> {
		try {
			const existing = await this.db.contributor.findUnique({
				where: { userId },
				select: { id: true },
			});
			return !!existing;
		} catch (error) {
			console.error('[ContributorService.exists]', error);
			return false;
		}
	}

	async getByUserId(userId: string): Promise<PrismaContributor | null> {
		try {
			return await this.db.contributor.findUnique({ where: { userId } });
		} catch (error) {
			console.error('[ContributorService.getByUserId]', error);
			return null;
		}
	}

	async getContributorTableViewForUser(userId: string): Promise<ServiceResult<ContributorTableView>> {
		try {
			const contributors = await this.db.contributor.findMany({
				where: {
					contributions: { some: { program: this.userAccessibleProgramsWhere(userId) } },
				},
				select: {
					id: true,
					createdAt: true,
					user: {
						select: {
							firstName: true,
							lastName: true,
							email: true,
							addressCountry: true,
							currency: true,
						},
					},
					contributions: {
						select: {
							program: {
								select: {
									name: true,
									operatorOrganization: {
										select: { users: { where: { id: userId }, select: { id: true }, take: 1 } },
									},
									viewerOrganization: {
										select: { users: { where: { id: userId }, select: { id: true }, take: 1 } },
									},
								},
							},
						},
					},
				},
				orderBy: { createdAt: 'desc' },
			});

			const hiddenProgramLabel = '🔒 Restricted Program';

			const tableRows: ContributorTableViewRow[] = contributors.map((contributor) => {
				const renderedProgramNames = contributor.contributions
					.map((contribution) => {
						const program = contribution.program;
						if (!program) return null;
						const canViewProgram =
							(program.operatorOrganization?.users?.length ?? 0) > 0 ||
							(program.viewerOrganization?.users?.length ?? 0) > 0;
						return canViewProgram ? (program.name ?? '') : hiddenProgramLabel;
					})
					.filter((label): label is string => Boolean(label));

				const uniqueProgramNamesInOrder: string[] = [];
				const seenLabels = new Set<string>();
				for (const label of renderedProgramNames) {
					if (!seenLabels.has(label)) {
						uniqueProgramNamesInOrder.push(label);
						seenLabels.add(label);
					}
				}
				const programName = uniqueProgramNamesInOrder.join(', ');

				const isOperatorOnAnyAccessibleProgram = contributor.contributions.some(
					(contribution) => (contribution.program?.operatorOrganization?.users?.length ?? 0) > 0,
				);
				const permission: ProgramPermission = isOperatorOnAnyAccessibleProgram ? 'operator' : 'viewer';

				return {
					id: contributor.id,
					firstName: contributor.user?.firstName ?? '',
					lastName: contributor.user?.lastName ?? '',
					email: contributor.user?.email ?? '',
					country: contributor.user?.addressCountry ?? null,
					currency: contributor.user?.currency ?? null,
					programName,
					createdAt: contributor.createdAt,
					createdAtFormatted: new Intl.DateTimeFormat('de-CH').format(contributor.createdAt),
					permission,
				};
			});

			return this.resultOk({ tableRows });
		} catch (error) {
			console.error('[ContributorService.getContributorTableViewForUser]', error);
			return this.resultFail('Could not fetch contributors');
		}
	}

	private userAccessibleProgramsWhere(userId: string) {
		return {
			OR: [
				{ viewerOrganization: { users: { some: { id: userId } } } },
				{ operatorOrganization: { users: { some: { id: userId } } } },
			],
		};
	}
}
