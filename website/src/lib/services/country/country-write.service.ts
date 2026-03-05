import { NetworkTechnology, SanctionRegime } from '@/generated/prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { UserReadService } from '../user/user-read.service';
import { CountryCreateInput, CountryPayload, CountryUpdateInput } from './country.types';

export class CountryWriteService extends BaseService {
	private userService = new UserReadService();

	async create(userId: string, input: CountryCreateInput): Promise<ServiceResult<CountryPayload>> {
		const isAdminResult = await this.userService.isAdmin(userId);

		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		try {
			const created = await this.db.country.create({
				data: {
					isoCode: input.isoCode,
					isActive: input.isActive,
					currency: input.currency,
					defaultPayoutAmount: input.defaultPayoutAmount,
					microfinanceIndex: input.microfinanceIndex ?? undefined,
					cashConditionOverride: input.cashConditionOverride,
					populationCoverage: input.populationCoverage ?? undefined,
					latestSurveyDate: input.latestSurveyDate ?? undefined,
					networkTechnology: input.networkTechnology ? (input.networkTechnology as NetworkTechnology) : undefined,
					mobileMoneyProviders: input.mobileMoneyProviderIds?.length
						? { connect: input.mobileMoneyProviderIds.map((id) => ({ id })) }
						: undefined,
					mobileMoneyConditionOverride: input.mobileMoneyConditionOverride,
					sanctions: input.sanctions ? (input.sanctions as SanctionRegime[]) : undefined,
					microfinanceSourceLink: input.microfinanceSourceLink
						? { create: { text: input.microfinanceSourceLink.text, href: input.microfinanceSourceLink.href } }
						: undefined,
					networkSourceLink: input.networkSourceLink
						? { create: { text: input.networkSourceLink.text, href: input.networkSourceLink.href } }
						: undefined,
				},
				include: {
					microfinanceSourceLink: true,
					networkSourceLink: true,
					mobileMoneyProviders: { select: { id: true, name: true } },
				},
			});

			return this.resultOk({
				id: created.id,
				isoCode: created.isoCode,
				isActive: created.isActive,
				currency: created.currency,
				defaultPayoutAmount: Number(created.defaultPayoutAmount),
				microfinanceIndex: created.microfinanceIndex ? Number(created.microfinanceIndex) : null,
				cashConditionOverride: created.cashConditionOverride ?? false,
				populationCoverage: created.populationCoverage ? Number(created.populationCoverage) : null,
				latestSurveyDate: created.latestSurveyDate ?? null,
				networkTechnology: created.networkTechnology ?? null,
				mobileMoneyProviders: created.mobileMoneyProviders ?? [],
				mobileMoneyConditionOverride: created.mobileMoneyConditionOverride ?? false,
				sanctions: created.sanctions ?? [],
				microfinanceSourceLink: created.microfinanceSourceLink
					? {
							id: created.microfinanceSourceLink.id,
							text: created.microfinanceSourceLink.text,
							href: created.microfinanceSourceLink.href,
						}
					: null,
				networkSourceLink: created.networkSourceLink
					? {
							id: created.networkSourceLink.id,
							text: created.networkSourceLink.text,
							href: created.networkSourceLink.href,
						}
					: null,
			});
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not create country: ${JSON.stringify(error)}`);
		}
	}

	async update(userId: string, input: CountryUpdateInput): Promise<ServiceResult<CountryPayload>> {
		const isAdminResult = await this.userService.isAdmin(userId);

		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		try {
			const updated = await this.db.country.update({
				where: { id: input.id },
				data: {
					isoCode: input.isoCode,
					isActive: input.isActive,
					currency: input.currency,
					defaultPayoutAmount: input.defaultPayoutAmount,
					microfinanceIndex: input.microfinanceIndex,
					cashConditionOverride: input.cashConditionOverride,
					populationCoverage: input.populationCoverage,
					latestSurveyDate: input.latestSurveyDate,
					networkTechnology: input.networkTechnology ? (input.networkTechnology as NetworkTechnology) : undefined,
					mobileMoneyProviders:
						input.mobileMoneyProviderIds !== undefined
							? { set: input.mobileMoneyProviderIds.map((id) => ({ id })) }
							: undefined,
					mobileMoneyConditionOverride: input.mobileMoneyConditionOverride,
					sanctions: input.sanctions ? (input.sanctions as SanctionRegime[]) : undefined,
					microfinanceSourceLink: input.microfinanceSourceLink
						? {
								upsert: {
									create: { text: input.microfinanceSourceLink.text, href: input.microfinanceSourceLink.href },
									update: { text: input.microfinanceSourceLink.text, href: input.microfinanceSourceLink.href },
								},
							}
						: undefined,
					networkSourceLink: input.networkSourceLink
						? {
								upsert: {
									create: { text: input.networkSourceLink.text, href: input.networkSourceLink.href },
									update: { text: input.networkSourceLink.text, href: input.networkSourceLink.href },
								},
							}
						: undefined,
				},
				include: {
					microfinanceSourceLink: true,
					networkSourceLink: true,
					mobileMoneyProviders: { select: { id: true, name: true } },
				},
			});

			return this.resultOk({
				id: updated.id,
				isoCode: updated.isoCode,
				isActive: updated.isActive,
				currency: updated.currency,
				defaultPayoutAmount: Number(updated.defaultPayoutAmount),
				microfinanceIndex: updated.microfinanceIndex ? Number(updated.microfinanceIndex) : null,
				cashConditionOverride: updated.cashConditionOverride ?? false,
				populationCoverage: updated.populationCoverage ? Number(updated.populationCoverage) : null,
				latestSurveyDate: updated.latestSurveyDate ?? null,
				networkTechnology: updated.networkTechnology ?? null,
				mobileMoneyProviders: updated.mobileMoneyProviders ?? [],
				mobileMoneyConditionOverride: updated.mobileMoneyConditionOverride ?? false,
				sanctions: updated.sanctions ?? [],
				microfinanceSourceLink: updated.microfinanceSourceLink
					? {
							id: updated.microfinanceSourceLink.id,
							text: updated.microfinanceSourceLink.text,
							href: updated.microfinanceSourceLink.href,
						}
					: null,
				networkSourceLink: updated.networkSourceLink
					? {
							id: updated.networkSourceLink.id,
							text: updated.networkSourceLink.text,
							href: updated.networkSourceLink.href,
						}
					: null,
			});
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not update country: ${JSON.stringify(error)}`);
		}
	}

	async delete(userId: string, countryId: string): Promise<ServiceResult<{ id: string }>> {
		const isAdminResult = await this.userService.isAdmin(userId);
		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		try {
			const country = await this.db.country.findUnique({
				where: { id: countryId },
				select: {
					id: true,
					_count: {
						select: {
							programs: true,
						},
					},
				},
			});

			if (!country) {
				return this.resultFail('Country not found');
			}

			if (country._count.programs > 0) {
				return this.resultFail('Cannot delete country because it is still used by programs');
			}

			await this.db.country.delete({
				where: { id: countryId },
			});

			return this.resultOk({ id: countryId });
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not delete country: ${JSON.stringify(error)}`);
		}
	}
}
