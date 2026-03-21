import { PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import {
	CountryFormCreateInput,
	CountryFormUpdateInput,
	countryCreateInputSchema,
	countryUpdateInputSchema,
} from './country-form-input';
import { CountryUpdateUniquenessContext } from './country-validation.types';

export class CountryValidationService extends BaseService {
	constructor(db: PrismaClient, loggerInstance = logger) {
		super(db, loggerInstance);
	}

	validateCreateInput(input: CountryFormCreateInput): ServiceResult<CountryFormCreateInput> {
		const parsedInput = countryCreateInputSchema.safeParse(input);
		if (!parsedInput.success) {
			return this.resultFail(parsedInput.error.issues[0]?.message ?? 'Invalid input.');
		}

		return this.resultOk(parsedInput.data);
	}

	validateUpdateInput(input: CountryFormUpdateInput): ServiceResult<CountryFormUpdateInput> {
		const parsedInput = countryUpdateInputSchema.safeParse(input);
		if (!parsedInput.success) {
			return this.resultFail(parsedInput.error.issues[0]?.message ?? 'Invalid input.');
		}

		return this.resultOk(parsedInput.data);
	}

	async validateCreateUniqueness(input: CountryFormCreateInput): Promise<ServiceResult<void>> {
		const isoCodeConflict = await this.db.country.findUnique({
			where: { isoCode: input.isoCode },
			select: { id: true },
		});
		if (isoCodeConflict) {
			return this.resultFail('A country with this ISO code already exists.');
		}

		return this.resultOk(undefined);
	}

	async validateUpdateUniqueness(
		input: CountryFormUpdateInput,
		context: CountryUpdateUniquenessContext,
	): Promise<ServiceResult<void>> {
		if (input.isoCode !== context.existingIsoCode) {
			const isoCodeConflict = await this.db.country.findUnique({
				where: { isoCode: input.isoCode },
				select: { id: true },
			});
			if (isoCodeConflict && isoCodeConflict.id !== context.countryId) {
				return this.resultFail('A country with this ISO code already exists.');
			}
		}

		return this.resultOk(undefined);
	}
}
