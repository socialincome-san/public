import { Program as PrismaProgram } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { CreateProgramInput } from './program.types';

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

	private async checkIfProgramExists(name: string): Promise<PrismaProgram | null> {
		return this.db.program.findFirst({
			where: { name },
		});
	}
}
