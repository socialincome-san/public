import { Session } from '@/lib/firebase/current-account';
import { parseCsvOptionalFields, parseCsvText } from '@/lib/utils/csv';
import { logger } from '@/lib/utils/logger';
import { ServiceResult } from '../core/base.types';
import { resultFail, resultOk } from '../core/service-result';
import { RecipientFormCreateInput } from './recipient-form-input';
import { RecipientWriteService } from './recipient-write.service';

export class RecipientImportService {
	constructor(
		private readonly recipientWriteService: RecipientWriteService,
		private readonly loggerInstance = logger,
	) {}

	private mapRowToRecipient(rowNumber: number, row: Record<string, string>): ServiceResult<RecipientFormCreateInput> {
		if (!row.firstName || !row.lastName) {
			return resultFail(`Row ${rowNumber}: firstName and lastName are required`);
		}

		if (!row.programId) {
			return resultFail(`Row ${rowNumber}: programId is required`);
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
			startDate: null,
			suspendedAt: null,
			suspensionReason: null,
			successorName: null,
			termsAccepted: false,
			programId: row.programId,
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
				const recipientResult = this.mapRowToRecipient(rowNumber, rows[i]);
				if (!recipientResult.success) {
					return resultFail(recipientResult.error);
				}

				const createResult = await this.recipientWriteService.create(session, recipientResult.data);
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
