import { PayoutProcess } from '@/generated/prisma/enums';
import { formatPayoutProcessLabel } from '@/lib/payout-process-options';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { isAdmin } from '@/modules/users/user.service';
import * as mobileMoneyProviderRepository from './mobile-money-provider.repository';
import type { MobileMoneyProviderCreateInput, MobileMoneyProviderUpdateInput } from './mobile-money-provider.schemas';
import type {
	MobileMoneyProviderOption,
	MobileMoneyProviderPaginatedTableView,
	MobileMoneyProviderPayload,
	MobileMoneyProviderTableQuery,
	PayoutProcessOverviewOption,
} from './mobile-money-provider.types';

export const getMobileMoneyProvider = async (
	userId: string,
	providerId: string,
): Promise<ServiceResult<MobileMoneyProviderPayload>> => {
	try {
		const isAdminResult = await isAdmin(userId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		const provider = await mobileMoneyProviderRepository.findMobileMoneyProviderById(providerId);

		return provider ? resultOk(provider) : resultFail('Could not get mobile money provider');
	} catch (error) {
		console.error('Could not get mobile money provider', {
			providerId,
			error,
		});

		return resultFail('Could not get mobile money provider');
	}
};

export const getPaginatedMobileMoneyProviderTableView = async (
	userId: string,
	query: MobileMoneyProviderTableQuery,
): Promise<ServiceResult<MobileMoneyProviderPaginatedTableView>> => {
	try {
		const isAdminResult = await isAdmin(userId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		const { providers, totalCount } = await mobileMoneyProviderRepository.findPaginatedMobileMoneyProviders(query);

		return resultOk({
			tableRows: providers.map((provider) => ({
				id: provider.id,
				name: provider.name,
				parentName: provider.parent?.name ?? null,
				payoutProcess: provider.payoutProcess,
				payoutProcessLabel: formatPayoutProcessLabel(provider.payoutProcess),
				createdAt: provider.createdAt,
			})),
			totalCount,
		});
	} catch (error) {
		console.error('Could not fetch mobile money providers', {
			userId,
			error,
		});

		return resultFail('Could not fetch mobile money providers');
	}
};

export const getMobileMoneyProviderOptions = async (userId: string): Promise<ServiceResult<MobileMoneyProviderOption[]>> => {
	try {
		const isAdminResult = await isAdmin(userId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		return resultOk(await mobileMoneyProviderRepository.findMobileMoneyProviderOptions());
	} catch (error) {
		console.error('Could not fetch mobile money provider options', { error });

		return resultFail('Could not fetch mobile money provider options');
	}
};

export const getRootMobileMoneyProviderOptions = async (
	userId: string,
): Promise<ServiceResult<MobileMoneyProviderOption[]>> => {
	try {
		const isAdminResult = await isAdmin(userId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		return resultOk(
			await mobileMoneyProviderRepository.findMobileMoneyProviderOptions({
				rootOnly: true,
			}),
		);
	} catch (error) {
		console.error('Could not fetch root mobile money provider options', {
			error,
		});

		return resultFail('Could not fetch root mobile money provider options');
	}
};

export const getSupportedMobileMoneyProviderOptions = async (): Promise<ServiceResult<MobileMoneyProviderOption[]>> => {
	try {
		return resultOk(await mobileMoneyProviderRepository.findMobileMoneyProviderOptions());
	} catch (error) {
		console.error('Could not fetch supported mobile money providers', {
			error,
		});

		return resultFail('Could not fetch supported mobile money providers');
	}
};

export const getPayoutProcessOverviewOptions = async (): Promise<ServiceResult<PayoutProcessOverviewOption[]>> => {
	try {
		const providers = await mobileMoneyProviderRepository.findMobileMoneyProvidersWithPayoutProcess();
		const options: PayoutProcessOverviewOption[] = [];
		const telecelCsvProviderNames: string[] = [];

		for (const provider of providers) {
			if (provider.payoutProcess === PayoutProcess.telecel_csv) {
				telecelCsvProviderNames.push(provider.name);
				continue;
			}
			if (!provider.payoutProcess) {
				continue;
			}

			options.push({
				kind: 'mobile_money_provider',
				id: provider.id,
				name: provider.name,
				payoutProcess: provider.payoutProcess,
			});
		}

		if (telecelCsvProviderNames.length > 0) {
			options.push({
				kind: 'telecel_csv',
				id: 'telecel_csv',
				name: formatPayoutProcessLabel(PayoutProcess.telecel_csv) ?? 'Telecel CSV upload',
				payoutProcess: PayoutProcess.telecel_csv,
				providerNames: telecelCsvProviderNames,
			});
		}

		return resultOk(options);
	} catch (error) {
		console.error('Could not fetch payout process overview options', {
			error,
		});

		return resultFail('Could not fetch payout process overview options');
	}
};

export const getMobileMoneyProviderPayoutProcess = async (
	providerId: string,
): Promise<ServiceResult<PayoutProcess | null>> => {
	try {
		const provider = await mobileMoneyProviderRepository.findMobileMoneyProviderPayoutProcess(providerId);
		if (!provider) {
			return resultFail('Mobile money provider not found');
		}

		return resultOk(provider.payoutProcess);
	} catch (error) {
		console.error('Could not fetch mobile money provider payout process', { providerId, error });

		return resultFail('Could not fetch mobile money provider payout process');
	}
};

export const getMobileMoneyProviderIdsByPayoutProcess = async (
	payoutProcess: PayoutProcess,
): Promise<ServiceResult<string[]>> => {
	try {
		const providers = await mobileMoneyProviderRepository.findMobileMoneyProviderIdsByPayoutProcess(payoutProcess);

		return resultOk(providers.map(({ id }) => id));
	} catch (error) {
		console.error('Could not fetch mobile money providers for payout process', { payoutProcess, error });

		return resultFail('Could not fetch mobile money providers for payout process');
	}
};

export const createMobileMoneyProvider = async (
	userId: string,
	input: MobileMoneyProviderCreateInput,
): Promise<ServiceResult<MobileMoneyProviderPayload>> => {
	try {
		const isAdminResult = await isAdmin(userId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		const nameConflict = await mobileMoneyProviderRepository.findMobileMoneyProviderByName(input.name);
		if (nameConflict) {
			return resultFail('A mobile money provider with this name already exists.');
		}

		const parentValidationResult = await validateParentId(input.parentId);
		if (!parentValidationResult.success) {
			return parentValidationResult;
		}

		return resultOk(await mobileMoneyProviderRepository.createMobileMoneyProvider(input));
	} catch (error) {
		console.error('Could not create mobile money provider', { error });

		return resultFail('Could not create mobile money provider. Please try again later.');
	}
};

export const updateMobileMoneyProvider = async (
	userId: string,
	input: MobileMoneyProviderUpdateInput,
): Promise<ServiceResult<MobileMoneyProviderPayload>> => {
	try {
		const isAdminResult = await isAdmin(userId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		const existing = await mobileMoneyProviderRepository.findMobileMoneyProviderById(input.id);
		if (!existing) {
			return resultFail('Mobile money provider not found');
		}

		if (input.name !== existing.name) {
			const nameConflict = await mobileMoneyProviderRepository.findMobileMoneyProviderByName(input.name);
			if (nameConflict && nameConflict.id !== input.id) {
				return resultFail('A mobile money provider with this name already exists.');
			}
		}

		const parentValidationResult = await validateParentId(input.parentId, input.id);
		if (!parentValidationResult.success) {
			return parentValidationResult;
		}

		return resultOk(await mobileMoneyProviderRepository.updateMobileMoneyProvider(input));
	} catch (error) {
		console.error('Could not update mobile money provider', {
			providerId: input.id,
			error,
		});

		return resultFail('Could not update mobile money provider. Please try again later.');
	}
};

export const deleteMobileMoneyProvider = async (
	userId: string,
	providerId: string,
): Promise<ServiceResult<{ id: string }>> => {
	try {
		const isAdminResult = await isAdmin(userId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		const provider = await mobileMoneyProviderRepository.findMobileMoneyProviderForDeletion(providerId);
		if (!provider) {
			return resultFail('Mobile money provider not found');
		}
		if (provider._count.countries > 0 || provider._count.paymentInformations > 0) {
			return resultFail('Cannot delete mobile money provider because it is still in use');
		}

		await mobileMoneyProviderRepository.deleteMobileMoneyProvider(providerId);

		return resultOk({ id: providerId });
	} catch (error) {
		console.error('Could not delete mobile money provider', {
			providerId,
			error,
		});

		return resultFail('Could not delete mobile money provider');
	}
};

const validateParentId = async (parentId: string | null | undefined, providerId?: string): Promise<ServiceResult<void>> => {
	if (!parentId) {
		return resultOk(undefined);
	}
	if (providerId && parentId === providerId) {
		return resultFail('A mobile money provider cannot be its own parent.');
	}

	const parent = await mobileMoneyProviderRepository.findMobileMoneyProviderParent(parentId);

	return parent ? resultOk(undefined) : resultFail('Selected parent mobile money provider does not exist.');
};
