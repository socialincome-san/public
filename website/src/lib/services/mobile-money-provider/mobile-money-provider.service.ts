import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { UserService } from '../user/user.service';
import {
	MobileMoneyProviderCreateInput,
	MobileMoneyProviderOption,
	MobileMoneyProviderPayload,
	MobileMoneyProviderTableView,
	MobileMoneyProviderTableViewRow,
	MobileMoneyProviderUpdateInput,
} from './mobile-money-provider.types';

export class MobileMoneyProviderService extends BaseService {
	private userService = new UserService();

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

	async get(userId: string, providerId: string): Promise<ServiceResult<MobileMoneyProviderPayload>> {
		const isAdminResult = await this.userService.isAdmin(userId);
		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		try {
			const provider = await this.db.mobileMoneyProvider.findUnique({
				where: { id: providerId },
			});
			if (!provider) {
				return this.resultFail('Could not get mobile money provider');
			}

			return this.resultOk({
				id: provider.id,
				name: provider.name,
				isSupported: provider.isSupported,
				createdAt: provider.createdAt,
				updatedAt: provider.updatedAt,
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not get mobile money provider: ${JSON.stringify(error)}`);
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

	async getTableView(userId: string): Promise<ServiceResult<MobileMoneyProviderTableView>> {
		const isAdminResult = await this.userService.isAdmin(userId);
		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		try {
			const providers = await this.db.mobileMoneyProvider.findMany({
				orderBy: { name: 'asc' },
			});
			const tableRows: MobileMoneyProviderTableViewRow[] = providers.map((p) => ({
				id: p.id,
				name: p.name,
				isSupported: p.isSupported,
				createdAt: p.createdAt,
			}));

			return this.resultOk({ tableRows });
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch mobile money providers: ${JSON.stringify(error)}`);
		}
	}

	async getOptions(userId: string): Promise<ServiceResult<MobileMoneyProviderOption[]>> {
		const isAdminResult = await this.userService.isAdmin(userId);
		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		try {
			const providers = await this.db.mobileMoneyProvider.findMany({
				select: { id: true, name: true },
				orderBy: { name: 'asc' },
			});

			return this.resultOk(providers);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch mobile money provider options: ${JSON.stringify(error)}`);
		}
	}

	async getSupportedOptions(): Promise<ServiceResult<MobileMoneyProviderOption[]>> {
		try {
			const providers = await this.db.mobileMoneyProvider.findMany({
				where: { isSupported: true },
				select: { id: true, name: true },
				orderBy: { name: 'asc' },
			});

			return this.resultOk(providers);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch supported mobile money providers: ${JSON.stringify(error)}`);
		}
	}
}
