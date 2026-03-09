import { PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { UserReadService } from '../user/user-read.service';
import {
	MobileMoneyProviderCreateInput,
	MobileMoneyProviderPayload,
	MobileMoneyProviderUpdateInput,
} from './mobile-money-provider.types';

export class MobileMoneyProviderWriteService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly userService: UserReadService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	async create(
		userId: string,
		input: MobileMoneyProviderCreateInput,
	): Promise<ServiceResult<MobileMoneyProviderPayload>> {
		const isAdminResult = await this.userService.isAdmin(userId);
		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		try {
			const created = await this.db.mobileMoneyProvider.create({
				data: {
					name: input.name,
					isSupported: input.isSupported,
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
			return this.resultFail(`Could not create mobile money provider: ${JSON.stringify(error)}`);
		}
	}

	async update(
		userId: string,
		input: MobileMoneyProviderUpdateInput,
	): Promise<ServiceResult<MobileMoneyProviderPayload>> {
		const isAdminResult = await this.userService.isAdmin(userId);
		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		try {
			const updated = await this.db.mobileMoneyProvider.update({
				where: { id: input.id },
				data: {
					...(input.name !== undefined && { name: input.name }),
					...(input.isSupported !== undefined && { isSupported: input.isSupported }),
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
			return this.resultFail(`Could not update mobile money provider: ${JSON.stringify(error)}`);
		}
	}

	async delete(userId: string, providerId: string): Promise<ServiceResult<{ id: string }>> {
		const isAdminResult = await this.userService.isAdmin(userId);
		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		try {
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
