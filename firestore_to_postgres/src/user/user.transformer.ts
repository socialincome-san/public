import { LanguageCode } from '@prisma/client';
import { CreateUserInput } from '@socialincome/shared/src/database/user/user.types';
import { User as FirestoreUser } from '@socialincome/shared/src/types/user';
import { BaseTransformer } from '../core/base.transformer';

export class UsersTransformer extends BaseTransformer<FirestoreUser, CreateUserInput> {
	transform = async (input: FirestoreUser[]): Promise<CreateUserInput[]> => {
		return input.map((raw): CreateUserInput => {
			const {
				auth_user_id,
				email,
				personal,
				payment_reference_id,
				stripe_customer_id,
				test_user,
				institution,
				language,
				currency,
				address,
			} = raw;

			return {
				authUserId: auth_user_id ?? '',

				email: email.toLowerCase(),
				firstName: personal?.name ?? '',
				lastName: personal?.lastname ?? '',
				gender: personal?.gender ?? 'private',
				phone: personal?.phone ?? null,
				company: personal?.company ?? null,
				referral: personal?.referral ?? null,

				paymentReferenceId: payment_reference_id?.toString() ?? null,
				stripeCustomerId: stripe_customer_id ?? null,
				testUser: test_user ?? false,
				institution: institution ?? false,
				language: this.isValidLanguage(language) ? language : 'en',
				currency: currency ?? null,

				addressStreet: address?.street ?? null,
				addressNumber: address?.number ?? null,
				addressCity: address?.city ?? null,
				addressZip: address?.zip ?? null,
				addressCountry: address?.country ?? null,

				role: 'contributor',
				organizationId: null, //todo add to si org
			};
		});
	};

	isValidLanguage(lang: string | undefined): lang is LanguageCode {
		return Object.values(LanguageCode).includes(lang as LanguageCode);
	}
}
