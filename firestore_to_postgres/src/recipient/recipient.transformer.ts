import { Gender, RecipientStatus, WhatsAppActivationStatus } from '@prisma/client';
import { DEFAULT_PROGRAM } from '../../scripts/seed-defaults';
import { BaseTransformer } from '../core/base.transformer';
import { FirestoreRecipientWithId, RecipientCreateInput } from './recipient.types';

export class RecipientTransformer extends BaseTransformer<FirestoreRecipientWithId, RecipientCreateInput> {
	transform = async (input: FirestoreRecipientWithId[]): Promise<RecipientCreateInput[]> => {
		const transformed: RecipientCreateInput[] = [];
		let skipped = 0;

		for (const raw of input) {
			if (raw.test_recipient) {
				skipped++;
				continue;
			}

			const legacyPartnerId = raw.organisation?.id.split('/').pop();

			const email = raw.email?.trim()
				? raw.email.toLowerCase()
				: this.generateFallbackEmail(raw.first_name, raw.last_name);

			const communicationPhone = raw.communication_mobile_phone?.phone
				? {
						connectOrCreate: {
							where: { number: raw.communication_mobile_phone.phone.toString() },
							create: {
								number: raw.communication_mobile_phone.phone.toString(),
								verified: true,
								whatsAppActivationStatus: this.mapWhatsAppStatus(
									raw.communication_mobile_phone.has_whatsapp,
									raw.communication_mobile_phone.whatsapp_activated,
								),
							},
						},
					}
				: undefined;

			const paymentPhone = raw.mobile_money_phone?.phone
				? {
						connectOrCreate: {
							where: { number: raw.mobile_money_phone.phone.toString() },
							create: {
								number: raw.mobile_money_phone.phone.toString(),
								verified: true,
								whatsAppActivationStatus: this.mapWhatsAppStatus(raw.mobile_money_phone.has_whatsapp, false),
							},
						},
					}
				: undefined;

			transformed.push({
				legacyFirestoreId: raw.id,
				status: this.mapStatus(raw.progr_status),
				startDate: raw.si_start_date?.toDate() ?? null,
				successorName: raw.successor ?? null,
				termsAccepted: raw.terms_accepted ?? false,
				program: { connect: { name: DEFAULT_PROGRAM.name } },
				localPartner: { connect: { legacyFirestoreId: legacyPartnerId } },
				paymentInformation: {
					create: {
						provider: 'orange_money',
						code: raw.om_uid?.toString() ?? '',
						phone: paymentPhone,
					},
				},
				contact: {
					create: {
						firstName: raw.first_name,
						lastName: raw.last_name,
						email,
						gender: this.mapGender(raw.gender),
						callingName: raw.calling_name ?? null,
						profession: raw.profession ?? null,
						language: raw.main_language ?? 'en',
						dateOfBirth: this.isValidDate(raw.birth_date) ? new Date(raw.birth_date) : null,
						phone: communicationPhone,
					},
				},
			});
		}

		if (skipped > 0) {
			console.log(`⚠️ Skipped ${skipped} test recipients`);
		}

		return transformed;
	};

	private mapWhatsAppStatus(hasWhatsApp: boolean, activated: boolean): WhatsAppActivationStatus {
		if (!hasWhatsApp) return WhatsAppActivationStatus.disabled;
		return activated ? WhatsAppActivationStatus.verified : WhatsAppActivationStatus.pending;
	}

	private mapStatus(status: string): RecipientStatus {
		switch (status) {
			case 'active':
				return RecipientStatus.active;
			case 'suspended':
				return RecipientStatus.suspended;
			case 'waitlisted':
				return RecipientStatus.waitlisted;
			case 'former':
				return RecipientStatus.former;
			default:
				throw new Error(`Unknown status ${status}`);
		}
	}

	private mapGender(value?: string): Gender {
		switch (value) {
			case 'male':
				return Gender.male;
			case 'female':
				return Gender.female;
			default:
				return Gender.private;
		}
	}

	private isValidDate(date: any): date is string | number | Date {
		return date && !isNaN(new Date(date).getTime());
	}

	private generateFallbackEmail(firstName: string, lastName: string): string {
		const namePart = `${firstName}.${lastName}`.toLowerCase().replace(/[^a-z0-9]/g, '');
		return `${namePart}@autocreated.socialincome`;
	}
}
