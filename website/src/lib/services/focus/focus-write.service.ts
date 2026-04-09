import { PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { UserReadService } from '../user/user-read.service';
import { FocusFormCreateInput, FocusFormUpdateInput } from './focus-form-input';
import { FocusValidationService } from './focus-validation.service';
import { FocusPayload } from './focus.types';

export class FocusWriteService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly userService: UserReadService,
		private readonly validationService: FocusValidationService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	private async assertAdmin(userId: string): Promise<ServiceResult<true>> {
		const isAdminResult = await this.userService.isAdmin(userId);
		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}
		if (!isAdminResult.data) {
			return this.resultFail('Permission denied');
		}

		return this.resultOk(true);
	}

	async create(userId: string, input: FocusFormCreateInput): Promise<ServiceResult<FocusPayload>> {
		try {
			const adminResult = await this.assertAdmin(userId);
			if (!adminResult.success) {
				return this.resultFail(adminResult.error);
			}

			const validatedInputResult = this.validationService.validateCreateInput(input);
			if (!validatedInputResult.success) {
				return this.resultFail(validatedInputResult.error);
			}
			const validatedInput = validatedInputResult.data;

			const uniquenessResult = await this.validationService.validateCreateUniqueness(validatedInput);
			if (!uniquenessResult.success) {
				return this.resultFail(uniquenessResult.error);
			}

			const created = await this.db.focus.create({
				data: {
					name: validatedInput.name,
				},
			});

			return this.resultOk({
				id: created.id,
				name: created.name,
				createdAt: created.createdAt,
				updatedAt: created.updatedAt,
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Could not create focus. Please try again later.');
		}
	}

	async update(userId: string, input: FocusFormUpdateInput): Promise<ServiceResult<FocusPayload>> {
		try {
			const adminResult = await this.assertAdmin(userId);
			if (!adminResult.success) {
				return this.resultFail(adminResult.error);
			}

			const validatedInputResult = this.validationService.validateUpdateInput(input);
			if (!validatedInputResult.success) {
				return this.resultFail(validatedInputResult.error);
			}
			const validatedInput = validatedInputResult.data;
			if (!validatedInput.id) {
				return this.resultFail('Focus id is required.');
			}

			const existing = await this.db.focus.findUnique({
				where: { id: validatedInput.id },
				select: { id: true, name: true },
			});
			if (!existing) {
				return this.resultFail('Focus not found');
			}

			const uniquenessResult = await this.validationService.validateUpdateUniqueness(validatedInput, {
				focusId: existing.id,
				existingName: existing.name,
			});
			if (!uniquenessResult.success) {
				return this.resultFail(uniquenessResult.error);
			}

			const updated = await this.db.focus.update({
				where: { id: validatedInput.id },
				data: {
					name: validatedInput.name,
				},
			});

			return this.resultOk({
				id: updated.id,
				name: updated.name,
				createdAt: updated.createdAt,
				updatedAt: updated.updatedAt,
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Could not update focus. Please try again later.');
		}
	}

	async delete(userId: string, focusId: string): Promise<ServiceResult<{ id: string }>> {
		try {
			const adminResult = await this.assertAdmin(userId);
			if (!adminResult.success) {
				return this.resultFail(adminResult.error);
			}

			const focus = await this.db.focus.findUnique({
				where: { id: focusId },
				select: {
					id: true,
					_count: {
						select: {
							localPartners: true,
							programs: true,
						},
					},
				},
			});
			if (!focus) {
				return this.resultFail('Focus not found');
			}

			if (focus._count.localPartners > 0 || focus._count.programs > 0) {
				return this.resultFail('Cannot delete focus because it is still in use');
			}

			await this.db.focus.delete({
				where: { id: focusId },
			});

			return this.resultOk({ id: focusId });
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not delete focus: ${JSON.stringify(error)}`);
		}
	}
}
