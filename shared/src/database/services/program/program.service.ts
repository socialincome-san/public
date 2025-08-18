import { Program as PrismaProgram } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { CreateProgramInput, ProgramForecastShape } from './program.types';

export class ProgramService extends BaseService {
	async create(input: CreateProgramInput): Promise<ServiceResult<PrismaProgram>> {
		try {
			const conflict = await this.checkIfProgramExists(input.name);
			if (conflict) {
				return this.resultFail('Program with this title already exists');
			}

			const program = await this.db.program.create({
				data: input,
			});

			return this.resultOk(program);
		} catch (e) {
			console.error('[ProgramService.create]', e);
			return this.resultFail('Could not create program');
		}
	}

	async getProgramsByUserId(userId: string) {
		try {
			const programs = await this.db.program.findMany({
				where: {
					OR: [
						{ viewerOrganization: { users: { some: { id: userId } } } },
						{ operatorOrganization: { users: { some: { id: userId } } } },
					],
				},
				orderBy: { name: 'asc' },
			});

			return this.resultOk(programs);
		} catch (e) {
			console.error('getProgramsByUserId error', e);
			return this.resultFail('Could not fetch programs for user');
		}
	}

	private async checkIfProgramExists(name: string): Promise<PrismaProgram | null> {
		return this.db.program.findFirst({
			where: { name },
		});
	}

	async getProgramNameByIdAndUserId(programId: string, userId: string): Promise<ServiceResult<{ name: string }>> {
		try {
			const program = await this.db.program.findFirst({
				where: {
					id: programId,
					OR: [
						{ viewerOrganization: { users: { some: { id: userId } } } },
						{ operatorOrganization: { users: { some: { id: userId } } } },
					],
				},
				select: { name: true },
			});

			if (!program) {
				return this.resultFail('Program not found or access denied');
			}

			return this.resultOk(program);
		} catch (e) {
			console.error('[ProgramService.getProgramNameByIdAndUserId]', e);
			return this.resultFail('Could not fetch program name');
		}
	}

	async getProgramForForecast(programId: string): Promise<ServiceResult<ProgramForecastShape>> {
		try {
			const program = await this.db.program.findUnique({
				where: { id: programId },
				select: {
					totalPayments: true,
					payoutAmount: true,
					payoutCurrency: true,
					payoutInterval: true,
				},
			});
			if (!program) return this.resultFail('Program not found');
			return this.resultOk(program);
		} catch (e) {
			console.error('[ProgramService.getProgramForForecast]', e);
			return this.resultFail('Could not fetch program');
		}
	}

	async getUserRoleForProgramId(programId: string, userId: string): Promise<ServiceResult<'operator' | 'viewer'>> {
		try {
			const program = await this.db.program.findUnique({
				where: { id: programId },
				select: {
					operatorOrganization: {
						select: {
							users: { where: { id: userId }, select: { id: true }, take: 1 },
						},
					},
					viewerOrganization: {
						select: {
							users: { where: { id: userId }, select: { id: true }, take: 1 },
						},
					},
				},
			});

			if (!program) return this.resultFail('Program not found');

			const isOperator = (program.operatorOrganization?.users?.length ?? 0) > 0;
			const isViewer = (program.viewerOrganization?.users?.length ?? 0) > 0;

			if (!isOperator && !isViewer) {
				return this.resultFail('Access denied for this program');
			}

			const role: 'operator' | 'viewer' = isOperator ? 'operator' : 'viewer';
			return this.resultOk(role);
		} catch (e) {
			console.error('[ProgramService.getUserRoleForProgramId]', e);
			return this.resultFail('Could not determine user role for program');
		}
	}
}
