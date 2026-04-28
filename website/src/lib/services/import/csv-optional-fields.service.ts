import { Gender } from '@/generated/prisma/client';
import { format, isValid, parse } from 'date-fns';
import { ServiceResult } from '../core/base.types';
import { resultFail, resultOk } from '../core/service-result';

export type CsvOptionalFieldValues = {
	contactPhone: string | undefined;
	paymentPhone: string | undefined;
	dateOfBirth: Date | null;
	gender: Gender | null;
	paymentInformationCode: string | null;
};

export class CsvOptionalFieldsService {
	private parseOptionalCsvValue(value: string | undefined): string | undefined {
		const trimmedValue = value?.trim();

		return trimmedValue ? trimmedValue : undefined;
	}

	private parseCsvGender(rowNumber: number, value: string | undefined): ServiceResult<Gender | null> {
		const normalizedValue = this.parseOptionalCsvValue(value)?.toLowerCase();
		if (!normalizedValue) {
			return resultOk(null);
		}

		switch (normalizedValue) {
			case Gender.male:
			case Gender.female:
			case Gender.other:
			case Gender.private:
				return resultOk(normalizedValue);
			default:
				return resultFail(`Row ${rowNumber}: gender must be one of male, female, other, private (case-insensitive)`);
		}
	}

	private parseCsvDateOfBirth(rowNumber: number, value: string | undefined): ServiceResult<Date | null> {
		const normalizedValue = this.parseOptionalCsvValue(value);
		if (!normalizedValue) {
			return resultOk(null);
		}

		const datePattern = /^\d{4}-\d{2}-\d{2}$/;
		if (!datePattern.test(normalizedValue)) {
			return resultFail(`Row ${rowNumber}: dateOfBirth must use YYYY-MM-DD format`);
		}

		const date = parse(normalizedValue, 'yyyy-MM-dd', new Date());
		if (!isValid(date) || format(date, 'yyyy-MM-dd') !== normalizedValue) {
			return resultFail(`Row ${rowNumber}: dateOfBirth must be a valid date in YYYY-MM-DD format`);
		}

		return resultOk(new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12)));
	}

	parseOptionalFields(rowNumber: number, row: Record<string, string>): ServiceResult<CsvOptionalFieldValues> {
		const dateOfBirthResult = this.parseCsvDateOfBirth(rowNumber, row.dateOfBirth);
		if (!dateOfBirthResult.success) {
			return resultFail(dateOfBirthResult.error);
		}

		const genderResult = this.parseCsvGender(rowNumber, row.gender);
		if (!genderResult.success) {
			return resultFail(genderResult.error);
		}

		return resultOk({
			contactPhone: this.parseOptionalCsvValue(row.contactPhone),
			paymentPhone: this.parseOptionalCsvValue(row.paymentPhone),
			dateOfBirth: dateOfBirthResult.data,
			gender: genderResult.data,
			paymentInformationCode: this.parseOptionalCsvValue(row.paymentInformationCode) ?? null,
		});
	}
}
