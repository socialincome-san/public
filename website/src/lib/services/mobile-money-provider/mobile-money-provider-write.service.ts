import { PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { UserReadService } from '../user/user-read.service';
import {
	MobileMoneyProviderFormCreateInput,
	MobileMoneyProviderFormUpdateInput,
} from './mobile-money-provider-form-input';
import { MobileMoneyProviderValidationService } from './mobile-money-provider-validation.service';
import { MobileMoneyProviderPayload } from './mobile-money-provider.types';

export class MobileMoneyProviderWriteService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly userService: UserReadService,
		private readonly validationService: MobileMoneyProviderValidationService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	async create(
		userId: string,
		input: MobileMoneyProviderFormCreateInput,
	): Promise<ServiceResult<MobileMoneyProviderPayload>> {
		try {
			const isAdminResult = await this.userService.isAdmin(userId);
			if (!isAdminResult.success) {
				return this.resultFail(isAdminResult.error);
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

			const created = await this.db.mobileMoneyProvider.create({
				data: {
					name: validatedInput.name,
					isSupported: validatedInput.isSupported,
				},
			});

			return this.resultOk({
				id: created.id,
				name: created.name,
				isSupported: created.isSupported,
				createdAt: created.createdAt,
				updatedAt: created.updatedAt,
			});
		} catch (error) {
			this.logger.error(error);
			return this.resultFail('Could not create mobile money provider. Please try again later.');
		}
	}

	async update(
		userId: string,
		input: MobileMoneyProviderFormUpdateInput,
	): Promise<ServiceResult<MobileMoneyProviderPayload>> {
		try {
			const isAdminResult = await this.userService.isAdmin(userId);
			if (!isAdminResult.success) {
				return this.resultFail(isAdminResult.error);
			}

			const validatedInputResult = this.validationService.validateUpdateInput(input);
			if (!validatedInputResult.success) {
				return this.resultFail(validatedInputResult.error);
			}
			const validatedInput = validatedInputResult.data;
			if (!validatedInput.id) {
				return this.resultFail('Mobile money provider id is required.');
			}

			const existing = await this.db.mobileMoneyProvider.findUnique({
				where: { id: validatedInput.id },
				select: { id: true, name: true },
			});
			if (!existing) {
				return this.resultFail('Mobile money provider not found');
			}

			const uniquenessResult = await this.validationService.validateUpdateUniqueness(validatedInput, {
				providerId: existing.id,
				existingName: existing.name,
			});
			if (!uniquenessResult.success) {
				return this.resultFail(uniquenessResult.error);
			}

			const updated = await this.db.mobileMoneyProvider.update({
				where: { id: validatedInput.id },
				data: {
					name: validatedInput.name,
					isSupported: validatedInput.isSupported,
				},
			});

			return this.resultOk({
				id: updated.id,
				name: updated.name,
				isSupported: updated.isSupported,
				createdAt: updated.createdAt,
				updatedAt: updated.updatedAt,
			});
		} catch (error) {
			this.logger.error(error);
			return this.resultFail('Could not update mobile money provider. Please try again later.');
		}
	}

	async delete(userId: string, providerId: string): Promise<ServiceResult<{ id: string }>> {
		try {
			const isAdminResult = await this.userService.isAdmin(userId);
			if (!isAdminResult.success) {
				return this.resultFail(isAdminResult.error);
			}

			const provider = await this.db.mobileMoneyProvider.findUnique({
				where: { id: providerId },
				select: {
					id: true,
					_count: {
						select: {
							countries: true,
							paymentInformations: true,
						},
					},
				},
			});

			if (!provider) {
				return this.resultFail('Mobile money provider not found');
			}

			if (provider._count.countries > 0 || provider._count.paymentInformations > 0) {
				return this.resultFail('Cannot delete mobile money provider because it is still in use');
			}

			await this.db.mobileMoneyProvider.delete({
				where: { id: providerId },
			});

			return this.resultOk({ id: providerId });
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not delete mobile money provider: ${JSON.stringify(error)}`);
		}
	}
}
