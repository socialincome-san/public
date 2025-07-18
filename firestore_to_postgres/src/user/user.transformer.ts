import { LanguageCode } from '@prisma/client';
import { CreateUserInput } from '@socialincome/shared/src/database/services/user/user.types';
import { User as FirestoreUser } from '@socialincome/shared/src/types/user';
import { BaseTransformer } from '../core/base.transformer';

export type CreateUserWithoutOrganization = Omit<CreateUserInput, 'organizationId'>;

export class UsersTransformer extends BaseTransformer<FirestoreUser, CreateUserWithoutOrganization> {
	transform = async (input: FirestoreUser[]): Promise<CreateUserWithoutOrganization[]> => {
		return input
			.filter((raw) => !raw.test_user)
			.map((raw): CreateUserWithoutOrganization => {
				const {
					auth_user_id,
					email,
					personal,
					payment_reference_id,
					stripe_customer_id,
					institution,
					language,
					currency,
					address,
				} = raw;

				return {
					authUserId: auth_user_id ?? null,
					email: email.toLowerCase(),
					firstName: personal?.name ?? '',
					lastName: personal?.lastname ?? '',
					gender: personal?.gender ?? 'private',
					phone: personal?.phone ?? null,
					company: personal?.company ?? null,
					referral: personal?.referral ?? null,
					paymentReferenceId: payment_reference_id?.toString() ?? null,
					stripeCustomerId: stripe_customer_id ?? null,
					institution: institution ?? false,
					language: this.isValidLanguage(language) ? language : 'en',
					currency: currency ?? null,
					addressStreet: address?.street ?? null,
					addressNumber: address?.number ?? null,
					addressCity: address?.city ?? null,
					addressZip: address?.zip ?? null,
					addressCountry: address?.country ?? null,
					role: 'user',
					callingName: null,
					birthDate: null,
					communicationPhone: null,
					hasWhatsAppComm: null,
					whatsappActivated: null,
					mobileMoneyPhone: null,
					hasWhatsAppMobile: null,
					instaHandle: null,
					twitterHandle: null,
					profession: null,
					omUid: null,
				};
			});
	};

	private isValidLanguage(lang: string | undefined): lang is LanguageCode {
		return Object.values(LanguageCode).includes(lang as LanguageCode);
	}
}
