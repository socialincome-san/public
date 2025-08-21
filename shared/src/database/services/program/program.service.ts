import { Program as PrismaProgram, RecipientStatus } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import {
	CreateProgramInput,
	ProgramPermission,
	ProgramWithOrganizations,
	ProgramWithRecipientsForForecast,
	UserProgramSummary,
} from './program.types';

export class ProgramService extends BaseService {
	async create(input: CreateProgramInput): Promise<ServiceResult<PrismaProgram>> {
		try {
			const existing = await this.findProgramByName(input.name);
			if (existing) return this.resultFail('Program with this title already exists');

			const program = await this.db.program.create({ data: input });
			return this.resultOk(program);
		} catch (e) {
			console.error('[ProgramService.create]', e);
			return this.resultFail('Could not create program');
		}
	}

	async findProgramByName(name: string): Promise<PrismaProgram | null> {
		return this.db.program.findFirst({ where: { name } });
	}

	async getUserAccessiblePrograms(userId: string): Promise<ServiceResult<UserProgramSummary[]>> {
		try {
			const programs = await this.db.program.findMany({
				where: this.userAccessibleProgramsWhere(userId),
				select: this.programSelectForUserSummary(userId),
				orderBy: { name: 'asc' },
			});

			const summaries = this.mapProgramsToUserSummaries(programs);
			return this.resultOk(summaries);
		} catch (e) {
			console.error('[ProgramService.getUserAccessiblePrograms]', e);
			return this.resultFail('Could not fetch programs for user');
		}
	}

	async getUserProgramSummary(programId: string, userId: string): Promise<ServiceResult<UserProgramSummary>> {
		try {
			const program = await this.db.program.findFirst({
				where: { id: programId, ...this.userAccessibleProgramsWhere(userId) },
				select: this.programSelectForUserSummary(userId),
			});

			if (!program) return this.resultFail('Program not found or access denied');

			const summary = this.mapProgramToUserSummary(program);
			return this.resultOk(summary);
		} catch (e) {
			console.error('[ProgramService.getUserProgramSummary]', e);
			return this.resultFail('Could not fetch program');
		}
	}

	async getProgramWithRecipientsForForecast(
		programId: string,
		userId: string,
	): Promise<ServiceResult<ProgramWithRecipientsForForecast>> {
		try {
			const program = await this.db.program.findFirst({
				where: { id: programId, ...this.userAccessibleProgramsWhere(userId) },
				select: {
					...this.programForecastSelect(),
					recipients: {
						where: { status: { in: [RecipientStatus.active, RecipientStatus.designated] } },
						select: { startDate: true },
					},
				},
			});

			if (!program) return this.resultFail('Program not found or access denied');

			return this.resultOk(program);
		} catch (e) {
			console.error('[ProgramService.getProgramForecastWithRecipientsForUser]', e);
			return this.resultFail('Could not fetch program forecast data');
		}
	}

	async getProgramPermissionForUser(userId: string, programId: string): Promise<ServiceResult<ProgramPermission>> {
		try {
			const program = await this.db.program.findFirst({
				where: { id: programId },
				select: {
					operatorOrganization: {
						select: { users: { where: { id: userId }, select: { id: true }, take: 1 } },
					},
					viewerOrganization: {
						select: { users: { where: { id: userId }, select: { id: true }, take: 1 } },
					},
				},
			});

			if (!program) return this.resultFail('Program not found');

			const isOperator = (program.operatorOrganization?.users?.length ?? 0) > 0;
			const permission: ProgramPermission = isOperator ? 'operator' : 'viewer';

			return this.resultOk(permission);
		} catch (error) {
			console.error('[RecipientService.getProgramPermissionForUser]', error);
			return this.resultFail('Could not fetch program permission');
		}
	}

	private programForecastSelect() {
		return {
			totalPayments: true,
			payoutAmount: true,
			payoutCurrency: true,
			payoutInterval: true,
		};
	}

	private userAccessibleProgramsWhere(userId: string) {
		return {
			OR: [
				{ viewerOrganization: { users: { some: { id: userId } } } },
				{ operatorOrganization: { users: { some: { id: userId } } } },
			],
		};
	}

	private programPermissionSelect(userId: string) {
		return {
			operatorOrganization: {
				select: { users: { where: { id: userId }, select: { id: true }, take: 1 } },
			},
			viewerOrganization: {
				select: { users: { where: { id: userId }, select: { id: true }, take: 1 } },
			},
		};
	}

	private programSelectForUserSummary(userId: string) {
		return {
			id: true,
			name: true,
			...this.programPermissionSelect(userId),
		};
	}

	private mapProgramsToUserSummaries(programs: ProgramWithOrganizations[]): UserProgramSummary[] {
		return programs.map(this.mapProgramToUserSummary);
	}

	private mapProgramToUserSummary = (program: ProgramWithOrganizations): UserProgramSummary => {
		const programPermission: ProgramPermission =
			(program.operatorOrganization?.users?.length ?? 0) > 0 ? 'operator' : 'viewer';

		return {
			id: program.id,
			name: program.name,
			programPermission,
		};
	};
}
