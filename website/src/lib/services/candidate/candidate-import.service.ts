import { Session } from '@/lib/firebase/current-account';
import { parseCsvText } from '@/lib/utils/csv';
import { logger } from '@/lib/utils/logger';
import { ServiceResult } from '../core/base.types';
import { resultFail, resultOk } from '../core/service-result';
import { CsvOptionalFieldsService } from '../import/csv-optional-fields.service';
import { CandidateFormCreateInput } from './candidate-form-input';
import { CandidateWriteService } from './candidate-write.service';

export class CandidateImportService {
	constructor(
		private readonly candidateWriteService: CandidateWriteService,
		private readonly csvOptionalFieldsService: CsvOptionalFieldsService,
		private readonly loggerInstance = logger,
	) {}

	private mapRowToCandidate(rowNumber: number, row: Record<string, string>): ServiceResult<CandidateFormCreateInput> {
		if (!row.firstName || !row.lastName) {
			return resultFail(`Row ${rowNumber}: firstName and lastName are required`);
		}

		if (!row.localPartnerId) {
			return resultFail(`Row ${rowNumber}: localPartnerId is required`);
		}

		const optionalFieldsResult = this.csvOptionalFieldsService.parseOptionalFields(rowNumber, row);
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
			let created = 0;
			const rows = parseCsvText(await file.text());

			for (let i = 0; i < rows.length; i++) {
				const rowNumber = i + 1;
				const candidateResult = this.mapRowToCandidate(rowNumber, rows[i]);
				if (!candidateResult.success) {
					return resultFail(candidateResult.error);
				}

				const createResult = await this.candidateWriteService.create(session, candidateResult.data);
				if (!createResult.success) {
					return resultFail(`Row ${rowNumber}: ${createResult.error}`);
				}

				created++;
			}

			return resultOk({ created });
		} catch (error) {
			this.loggerInstance.error(error);

			return resultFail(error instanceof Error ? error.message : 'Failed to parse CSV file');
		}
	}
}
