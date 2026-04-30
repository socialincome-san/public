import { Session } from '@/lib/firebase/current-account';
import { parseCsvOptionalFields, parseCsvText } from '@/lib/utils/csv';
import { logger } from '@/lib/utils/logger';
import { ServiceResult } from '../core/base.types';
import { resultFail, resultOk } from '../core/service-result';
import { CandidateFormCreateInput } from './candidate-form-input';
import { CandidateValidationService } from './candidate-validation.service';
import { CandidateWriteService } from './candidate-write.service';

export class CandidateImportService {
	constructor(
		private readonly candidateWriteService: CandidateWriteService,
		private readonly candidateValidationService: CandidateValidationService,
		private readonly loggerInstance = logger,
	) {}

	private mapRowToCandidate(rowNumber: number, row: Record<string, string>): ServiceResult<CandidateFormCreateInput> {
		if (!row.firstName || !row.lastName) {
			return resultFail(`Row ${rowNumber}: firstName and lastName are required`);
		}

		if (!row.localPartnerId) {
			return resultFail(`Row ${rowNumber}: localPartnerId is required`);
		}

		const optionalFieldsResult = parseCsvOptionalFields(rowNumber, row);
		if (!optionalFieldsResult.success) {
			return resultFail(optionalFieldsResult.error);
		}
		const optionalFields = optionalFieldsResult.data;

		return resultOk({
			suspendedAt: null,
			suspensionReason: null,
			successorName: null,
			termsAccepted: false,
			localPartnerId: row.localPartnerId,
			paymentInformation: {
				mobileMoneyProviderId: undefined,
				code: optionalFields.paymentInformationCode,
				phone: optionalFields.paymentPhone,
			},
			contact: {
				firstName: row.firstName,
				lastName: row.lastName,
				callingName: null,
				email: null,
				gender: optionalFields.gender,
				language: null,
				dateOfBirth: optionalFields.dateOfBirth,
				profession: null,
				phone: optionalFields.contactPhone,
				hasWhatsApp: false,
				street: null,
				number: null,
				city: null,
				zip: null,
				country: null,
			},
		});
	}

	async importCsv(session: Session, file: File): Promise<ServiceResult<{ created: number }>> {
		try {
			const rows = parseCsvText(await file.text());
			const validatedCandidates: CandidateFormCreateInput[] = [];
			const validationErrors: string[] = [];

			for (let i = 0; i < rows.length; i++) {
				const rowNumber = i + 1;
				const candidateResult = this.mapRowToCandidate(rowNumber, rows[i]);
				if (!candidateResult.success) {
					validationErrors.push(candidateResult.error);

					continue;
				}

				const validatedInputResult = this.candidateValidationService.validateCreateInput(candidateResult.data);
				if (!validatedInputResult.success) {
					validationErrors.push(`Row ${rowNumber}: ${validatedInputResult.error}`);

					continue;
				}

				const uniquenessResult = await this.candidateValidationService.validateCreateUniqueness(validatedInputResult.data);
				if (!uniquenessResult.success) {
					validationErrors.push(`Row ${rowNumber}: ${uniquenessResult.error}`);

					continue;
				}

				validatedCandidates.push(validatedInputResult.data);
			}

			if (validationErrors.length > 0) {
				return resultFail(validationErrors.join('\n'));
			}

			for (let i = 0; i < validatedCandidates.length; i++) {
				const rowNumber = i + 1;
				const createResult = await this.candidateWriteService.create(session, validatedCandidates[i]);
				if (!createResult.success) {
					return resultFail(`Row ${rowNumber}: ${createResult.error}`);
				}
			}

			return resultOk({ created: validatedCandidates.length });
		} catch (error) {
			this.loggerInstance.error(error);

			return resultFail(error instanceof Error ? error.message : 'Failed to parse CSV file');
		}
	}
}
