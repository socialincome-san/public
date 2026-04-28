import { Gender } from '@/generated/prisma/enums';
import { format, isValid, parse } from 'date-fns';
import { ServiceResult } from '../services/core/base.types';
import { resultFail, resultOk } from '../services/core/service-result';
import { CSV_DOUBLE_QUOTES_REGEX, CSV_NEEDS_QUOTES_REGEX } from './regex';

export type CsvRow = Record<string, string>;

type CsvOptionalFieldValues = {
	contactPhone: string | undefined;
	paymentPhone: string | undefined;
	dateOfBirth: Date | null;
	gender: Gender | null;
	paymentInformationCode: string | null;
};

export const parseCsvText = (text: string): CsvRow[] => {
	const lines = text
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean);

	if (lines.length < 2) {
		throw new Error('CSV must contain a header row and at least one data row.');
	}

	const [headerLine, ...dataLines] = lines;
	const headers = headerLine.split(',').map((h) => h.trim());

	if (headers.length === 0) {
		throw new Error('CSV header is empty.');
	}

	return dataLines.map((line, index) => {
		const values = line.split(',');

		if (values.length !== headers.length) {
			throw new Error(`Row ${index + 2} has an invalid number of columns.`);
		}

		return Object.fromEntries(headers.map((header, i) => [header, values[i]?.trim() ?? '']));
	});
};

export const parseCsvFile = async (file: File): Promise<CsvRow[]> => {
	const text = await file.text();

	return parseCsvText(text);
};

const parseOptionalCsvValue = (value: string | undefined): string | undefined => {
	const trimmedValue = value?.trim();

	return trimmedValue ?? undefined;
};

const parseCsvGender = (rowNumber: number, value: string | undefined): ServiceResult<Gender | null> => {
	const normalizedValue = parseOptionalCsvValue(value)?.toLowerCase();
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
};

const parseCsvDateOfBirth = (rowNumber: number, value: string | undefined): ServiceResult<Date | null> => {
	const normalizedValue = parseOptionalCsvValue(value);
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
};

export const parseCsvOptionalFields = (
	rowNumber: number,
	row: Record<string, string>,
): ServiceResult<CsvOptionalFieldValues> => {
	const dateOfBirthResult = parseCsvDateOfBirth(rowNumber, row.dateOfBirth);
	if (!dateOfBirthResult.success) {
		return resultFail(dateOfBirthResult.error);
	}

	const genderResult = parseCsvGender(rowNumber, row.gender);
	if (!genderResult.success) {
		return resultFail(genderResult.error);
	}

	return resultOk({
		contactPhone: parseOptionalCsvValue(row.contactPhone),
		paymentPhone: parseOptionalCsvValue(row.paymentPhone),
		dateOfBirth: dateOfBirthResult.data,
		gender: genderResult.data,
		paymentInformationCode: parseOptionalCsvValue(row.paymentInformationCode) ?? null,
	});
};

const escapeCsvValue = (value: string): string => {
	const escaped = value.replace(CSV_DOUBLE_QUOTES_REGEX, '""');

	return CSV_NEEDS_QUOTES_REGEX.test(escaped) ? `"${escaped}"` : escaped;
};

export const stringifyCsv = (rows: CsvRow[], headers?: string[]): string => {
	const resolvedHeaders = headers ?? (rows.length > 0 ? Object.keys(rows[0]) : []);
	const headerLine = resolvedHeaders.map((header) => escapeCsvValue(header)).join(',');

	const dataLines = rows.map((row) => resolvedHeaders.map((header) => escapeCsvValue(row[header] ?? '')).join(','));

	return [headerLine, ...dataLines].join('\n');
};

export const downloadCsv = (content: string, filename: string): void => {
	const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
};
