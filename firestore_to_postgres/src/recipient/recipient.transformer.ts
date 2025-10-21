import { Gender, RecipientStatus } from '@prisma/client';
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

			const communicationPhone = raw.communication_mobile_phone?.phone
				? {
						connectOrCreate: {
							where: { number: raw.communication_mobile_phone.phone.toString() },
							create: {
								number: raw.communication_mobile_phone.phone.toString(),
								hasWhatsApp: raw.communication_mobile_phone.has_whatsapp,
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
								hasWhatsApp: raw.mobile_money_phone.has_whatsapp,
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
						email: raw.email?.trim() || null,
						gender: this.mapGender(raw.gender),
						callingName: raw.calling_name ?? null,
						profession: raw.profession ?? null,
						language: raw.main_language ?? 'en',
						dateOfBirth: this.parseDate(raw.birth_date),
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
				if (process.env.FIREBASE_DATABASE_URL?.includes('staging')) {
					console.log(`💡 Unknown recipient status "${status}" → falling back to ACTIVE (staging only).`);
					return RecipientStatus.active;
				}
				throw new Error(`Unknown recipient status "${status}" in production environment.`);
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

	private parseDate(value: any): Date | null {
		if (!value) return null;

		if (typeof value.toDate === 'function') {
			return value.toDate();
		}

		const date = new Date(value);
		return isNaN(date.getTime()) ? null : date;
	}
}
