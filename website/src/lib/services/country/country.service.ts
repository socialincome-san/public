import { NetworkTechnology } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { UserService } from '../user/user.service';
import {
	CountryCreateInput,
	CountryPayload,
	CountryTableView,
	CountryTableViewRow,
	CountryUpdateInput,
} from './country.types';

export class CountryService extends BaseService {
	private userService = new UserService();

	async create(userId: string, input: CountryCreateInput): Promise<ServiceResult<CountryPayload>> {
		const isAdminResult = await this.userService.isAdmin(userId);

		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		try {
			const created = await this.db.country.create({
				data: {
					name: input.name,
					microfinanceIndex: input.microfinanceIndex ?? undefined,
					populationCoverage: input.populationCoverage ?? undefined,
					latestSurveyDate: input.latestSurveyDate ?? undefined,
					networkTechnology: input.networkTechnology ? (input.networkTechnology as NetworkTechnology) : undefined,
					microfinanceSourceLink: input.microfinanceSourceLink
						? { create: { text: input.microfinanceSourceLink.text, href: input.microfinanceSourceLink.href } }
						: undefined,
					networkSourceLink: input.networkSourceLink
						? { create: { text: input.networkSourceLink.text, href: input.networkSourceLink.href } }
						: undefined,
				},
				include: { microfinanceSourceLink: true, networkSourceLink: true },
			});

			return this.resultOk({
				id: created.id,
				name: created.name,
				microfinanceIndex: created.microfinanceIndex ? Number(created.microfinanceIndex) : null,
				populationCoverage: created.populationCoverage ? Number(created.populationCoverage) : null,
				latestSurveyDate: created.latestSurveyDate ?? null,
				networkTechnology: created.networkTechnology ?? null,
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
			return this.resultFail(`Could not create country: ${error}`);
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
					name: input.name,
					microfinanceIndex: input.microfinanceIndex,
					populationCoverage: input.populationCoverage,
					latestSurveyDate: input.latestSurveyDate,
					networkTechnology: input.networkTechnology ? (input.networkTechnology as NetworkTechnology) : undefined,
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
				include: { microfinanceSourceLink: true, networkSourceLink: true },
			});

			return this.resultOk({
				id: updated.id,
				name: updated.name,
				microfinanceIndex: updated.microfinanceIndex ? Number(updated.microfinanceIndex) : null,
				populationCoverage: updated.populationCoverage ? Number(updated.populationCoverage) : null,
				latestSurveyDate: updated.latestSurveyDate ?? null,
				networkTechnology: updated.networkTechnology ?? null,
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
			return this.resultFail(`Could not update country: ${error}`);
		}
	}

	async get(userId: string, countryId: string): Promise<ServiceResult<CountryPayload>> {
		const isAdminResult = await this.userService.isAdmin(userId);

		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		try {
			const country = await this.db.country.findUnique({
				where: { id: countryId },
				include: { microfinanceSourceLink: true, networkSourceLink: true },
			});

			if (!country) {
				return this.resultFail('Could not get country');
			}

			return this.resultOk({
				id: country.id,
				name: country.name,
				microfinanceIndex: country.microfinanceIndex ? Number(country.microfinanceIndex) : null,
				populationCoverage: country.populationCoverage ? Number(country.populationCoverage) : null,
				latestSurveyDate: country.latestSurveyDate ?? null,
				networkTechnology: country.networkTechnology ?? null,
				microfinanceSourceLink: country.microfinanceSourceLink
					? {
							id: country.microfinanceSourceLink.id,
							text: country.microfinanceSourceLink.text,
							href: country.microfinanceSourceLink.href,
						}
					: null,
				networkSourceLink: country.networkSourceLink
					? {
							id: country.networkSourceLink.id,
							text: country.networkSourceLink.text,
							href: country.networkSourceLink.href,
						}
					: null,
			});
		} catch (error) {
			this.logger.error(error);
			return this.resultFail('Could not get country');
		}
	}

	async getTableView(userId: string): Promise<ServiceResult<CountryTableView>> {
		const isAdminResult = await this.userService.isAdmin(userId);

		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		try {
			const countries = await this.db.country.findMany({
				select: {
					id: true,
					name: true,
					microfinanceIndex: true,
					populationCoverage: true,
					networkTechnology: true,
					latestSurveyDate: true,
					createdAt: true,
				},
				orderBy: [{ name: 'asc' }],
			});

			const tableRows: CountryTableViewRow[] = countries.map((c) => ({
				id: c.id,
				name: c.name,
				microfinanceIndex: c.microfinanceIndex ? Number(c.microfinanceIndex) : null,
				populationCoverage: c.populationCoverage ? Number(c.populationCoverage) : null,
				networkTechnology: c.networkTechnology ?? null,
				latestSurveyDate: c.latestSurveyDate ?? null,
				createdAt: c.createdAt,
			}));

			return this.resultOk({ tableRows });
		} catch (error) {
			this.logger.error(error);
			return this.resultFail('Could not fetch countries');
		}
	}
}
