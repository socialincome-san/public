import { NetworkTechnology, PrismaClient, SanctionRegime } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { UserReadService } from '../user/user-read.service';
import { CountryFormCreateInput, CountryFormUpdateInput } from './country-form-input';
import { CountryPayload } from './country.types';
import { CountryValidationService } from './country-validation.service';

export class CountryWriteService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly userService: UserReadService,
		private readonly countryValidationService: CountryValidationService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	async create(userId: string, input: CountryFormCreateInput): Promise<ServiceResult<CountryPayload>> {
		try {
			const isAdminResult = await this.userService.isAdmin(userId);

			if (!isAdminResult.success) {
				return this.resultFail(isAdminResult.error);
			}

			const validatedInputResult = this.countryValidationService.validateCreateInput(input);
			if (!validatedInputResult.success) {
				return this.resultFail(validatedInputResult.error);
			}
			const validatedInput = validatedInputResult.data;

			const uniquenessResult = await this.countryValidationService.validateCreateUniqueness(validatedInput);
			if (!uniquenessResult.success) {
				return this.resultFail(uniquenessResult.error);
			}

			const created = await this.db.country.create({
				data: {
					isoCode: validatedInput.isoCode,
					isActive: validatedInput.isActive,
					currency: validatedInput.currency,
					defaultPayoutAmount: validatedInput.defaultPayoutAmount,
					microfinanceIndex: validatedInput.microfinanceIndex ?? undefined,
					cashConditionOverride: validatedInput.cashConditionOverride,
					populationCoverage: validatedInput.populationCoverage ?? undefined,
					latestSurveyDate: validatedInput.latestSurveyDate ?? undefined,
					networkTechnology: validatedInput.networkTechnology
						? (validatedInput.networkTechnology as NetworkTechnology)
						: undefined,
					mobileMoneyProviders: validatedInput.mobileMoneyProviderIds?.length
						? { connect: validatedInput.mobileMoneyProviderIds.map((id) => ({ id })) }
						: undefined,
					mobileMoneyConditionOverride: validatedInput.mobileMoneyConditionOverride,
					sanctions: validatedInput.sanctions ? (validatedInput.sanctions as SanctionRegime[]) : undefined,
					microfinanceSourceLink: validatedInput.microfinanceSourceLink
						? { create: { text: validatedInput.microfinanceSourceLink.text, href: validatedInput.microfinanceSourceLink.href } }
						: undefined,
					networkSourceLink: validatedInput.networkSourceLink
						? { create: { text: validatedInput.networkSourceLink.text, href: validatedInput.networkSourceLink.href } }
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
			return this.resultFail('Could not create country. Please try again later.');
		}
	}

	async update(userId: string, input: CountryFormUpdateInput): Promise<ServiceResult<CountryPayload>> {
		try {
			const isAdminResult = await this.userService.isAdmin(userId);

			if (!isAdminResult.success) {
				return this.resultFail(isAdminResult.error);
			}

			const validatedInputResult = this.countryValidationService.validateUpdateInput(input);
			if (!validatedInputResult.success) {
				return this.resultFail(validatedInputResult.error);
			}
			const validatedInput = validatedInputResult.data;
			if (!validatedInput.id) {
				return this.resultFail('Country id is required.');
			}

			const existingCountry = await this.db.country.findUnique({
				where: { id: validatedInput.id },
				select: { id: true, isoCode: true },
			});
			if (!existingCountry) {
				return this.resultFail('Country not found');
			}

			const uniquenessResult = await this.countryValidationService.validateUpdateUniqueness(validatedInput, {
				countryId: existingCountry.id,
				existingIsoCode: existingCountry.isoCode,
			});
			if (!uniquenessResult.success) {
				return this.resultFail(uniquenessResult.error);
			}

			const updated = await this.db.country.update({
				where: { id: validatedInput.id },
				data: {
					isoCode: validatedInput.isoCode,
					isActive: validatedInput.isActive,
					currency: validatedInput.currency,
					defaultPayoutAmount: validatedInput.defaultPayoutAmount,
					microfinanceIndex: validatedInput.microfinanceIndex,
					cashConditionOverride: validatedInput.cashConditionOverride,
					populationCoverage: validatedInput.populationCoverage,
					latestSurveyDate: validatedInput.latestSurveyDate,
					networkTechnology: validatedInput.networkTechnology
						? (validatedInput.networkTechnology as NetworkTechnology)
						: undefined,
					mobileMoneyProviders:
						validatedInput.mobileMoneyProviderIds !== undefined
							? { set: validatedInput.mobileMoneyProviderIds.map((id) => ({ id })) }
							: undefined,
					mobileMoneyConditionOverride: validatedInput.mobileMoneyConditionOverride,
					sanctions: validatedInput.sanctions ? (validatedInput.sanctions as SanctionRegime[]) : undefined,
					microfinanceSourceLink: validatedInput.microfinanceSourceLink
						? {
								upsert: {
									create: {
										text: validatedInput.microfinanceSourceLink.text,
										href: validatedInput.microfinanceSourceLink.href,
									},
									update: {
										text: validatedInput.microfinanceSourceLink.text,
										href: validatedInput.microfinanceSourceLink.href,
									},
								},
							}
						: undefined,
					networkSourceLink: validatedInput.networkSourceLink
						? {
								upsert: {
									create: { text: validatedInput.networkSourceLink.text, href: validatedInput.networkSourceLink.href },
									update: { text: validatedInput.networkSourceLink.text, href: validatedInput.networkSourceLink.href },
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
			return this.resultFail('Could not update country. Please try again later.');
		}
	}

	async delete(userId: string, countryId: string): Promise<ServiceResult<{ id: string }>> {
		try {
			const isAdminResult = await this.userService.isAdmin(userId);
			if (!isAdminResult.success) {
				return this.resultFail(isAdminResult.error);
			}

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
