import { CreateRecipientInput } from '@socialincome/shared/src/database/services/recipient/recipient.types';
import { CreateUserInput } from '@socialincome/shared/src/database/services/user/user.types';
import { Recipient as FirestoreRecipient } from '@socialincome/shared/src/types/recipient';
import { BaseTransformer } from '../core/base.transformer';

const PARTNER_ORG_ID_NAME_MAP: Record<string, string> = {
	aurora: 'Aurora',
	equal_rights: 'Equal Rights Alliance',
	fcc: 'Freetown City Council',
	jamil: 'Jamil & Nyanga Jaward',
	rainbo: 'Rainbo Initiative',
	reachout: 'Reachout Salone',
	slaes: 'Sierra Leone Association of Ebola Survivors',
	social_income: 'Social Income',
	test: 'Test',
	united_polio: 'United Polio Brothers & Sisters',
};

export type CreateRecipientWithUser = {
	user: CreateUserInput;
	recipient: Omit<CreateRecipientInput, 'userId' | 'organizationId' | 'programId' | 'localPartnerId'>;
	partnerOrgName: string | null;
};

export class RecipientsTransformer extends BaseTransformer<FirestoreRecipient, CreateRecipientWithUser> {
	transform = async (input: FirestoreRecipient[]): Promise<CreateRecipientWithUser[]> => {
		return input
			.filter((raw) => !raw.test_recipient)
			.map((raw): CreateRecipientWithUser => {
				const {
					birth_date,
					calling_name,
					communication_mobile_phone,
					email,
					first_name,
					last_name,
					gender,
					insta_handle,
					main_language,
					mobile_money_phone,
					om_uid,
					profession,
					progr_status,
					si_start_date,
					twitter_handle,
					organisation,
				} = raw;

				const id = organisation?.id.split('/').pop() ?? null;
				const partnerOrgName = id ? (PARTNER_ORG_ID_NAME_MAP[id] ?? null) : null;

				return {
					user: {
						authUserId: null,
						email: email?.trim() ? email.toLowerCase() : this.generateFallbackEmail(first_name, last_name),
						firstName: first_name,
						lastName: last_name,
						gender,
						callingName: calling_name ?? null,
						birthDate: this.isValidDate(birth_date) ? new Date(birth_date) : null,
						communicationPhone: communication_mobile_phone?.phone?.toString() ?? null,
						hasWhatsAppComm: communication_mobile_phone?.has_whatsapp ?? null,
						whatsappActivated: communication_mobile_phone?.whatsapp_activated ?? null,
						mobileMoneyPhone: mobile_money_phone?.phone?.toString() ?? null,
						hasWhatsAppMobile: mobile_money_phone?.has_whatsapp ?? null,
						instaHandle: insta_handle ?? null,
						twitterHandle: twitter_handle ?? null,
						profession: profession ?? null,
						omUid: om_uid ?? null,
						role: 'user',
						language: main_language ?? 'en',
						currency: null,
						phone: null,
						company: null,
						referral: null,
						paymentReferenceId: null,
						stripeCustomerId: null,
						institution: false,
						addressStreet: null,
						addressNumber: null,
						addressCity: null,
						addressZip: null,
						addressCountry: null,
						organizationId: null,
					},
					recipient: {
						status: progr_status,
						startDate: si_start_date?.toDate() ?? null,
					},
					partnerOrgName,
				};
			});
	};

	private isValidDate(date: any): date is string | number | Date {
		return date && !isNaN(new Date(date).getTime());
	}

	private generateFallbackEmail(firstName: string, lastName: string): string {
		const namePart = `${firstName}.${lastName}`.toLowerCase().replace(/[^a-z0-9]/g, '');
		return `${namePart}@autocreated.socialincome`;
	}
}
