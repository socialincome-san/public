import { PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { ProgramSettingsFormUpdateInput, programSettingsUpdateInputSchema } from './program-settings-form-input';

export class ProgramValidationService extends BaseService {
	constructor(db: PrismaClient, loggerInstance = logger) {
		super(db, loggerInstance);
	}

	validateSettingsUpdateInput(input: ProgramSettingsFormUpdateInput): ServiceResult<ProgramSettingsFormUpdateInput> {
		const parsedInput = programSettingsUpdateInputSchema.safeParse(input);
		if (!parsedInput.success) {
			return this.resultFail(parsedInput.error.issues[0]?.message ?? 'Invalid input.');
		}

		return this.resultOk(parsedInput.data);
	}

	async validateUpdateUniqueness(input: ProgramSettingsFormUpdateInput): Promise<ServiceResult<void>> {
		const existingByName = await this.db.program.findUnique({
			where: { name: input.name },
			select: { id: true },
		});
		if (existingByName && existingByName.id !== input.id) {
			return this.resultFail('A program with this name already exists.');
		}

		return this.resultOk(undefined);
	}
}
