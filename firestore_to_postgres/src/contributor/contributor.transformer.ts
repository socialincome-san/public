import { ContributorReferralSource, Gender } from '@prisma/client';
import { randomUUID } from 'crypto';
import { BaseTransformer } from '../core/base.transformer';
import { ContributorCreateInput, FirestoreContributorWithId } from './contributor.types';

export class ContributorTransformer extends BaseTransformer<FirestoreContributorWithId, ContributorCreateInput> {
	transform = async (input: FirestoreContributorWithId[]): Promise<ContributorCreateInput[]> => {
		const transformed: ContributorCreateInput[] = [];

		for (const doc of input) {
			if (doc.test_user) continue;

			const { personal, address } = doc;
			const email = doc.email.toLowerCase();
			const authId = doc.auth_user_id || this.generateManualAuthId();

			transformed.push({
				firebaseAuthUserId: authId,
				contributor: {
					create: {
						legacyFirestoreId: doc.id,
						referral: this.mapReferral(personal?.referral),
						paymentReferenceId: doc.payment_reference_id?.toString() ?? null,
						stripeCustomerId: doc.stripe_customer_id ?? null,
						institution: doc.institution ?? false,
						contact: {
							create: {
								firstName: personal?.name ?? '',
								lastName: personal?.lastname ?? '',
								email,
								gender: this.mapGender(personal?.gender),
								profession: personal?.company ?? null,
								language: doc.language ?? null,
								address: address
									? {
											create: {
												street: address.street ?? '',
												number: address.number ?? '',
												city: address.city ?? '',
												zip: address.zip?.toString() ?? '',
												country: address.country ?? 'Unknown',
											},
										}
									: undefined,
								phone: personal?.phone
									? {
											create: {
												number: personal.phone,
												verified: false,
											},
										}
									: undefined,
							},
						},
					},
				},
			});
		}

		return transformed;
	};

	private generateManualAuthId(): string {
		return `manual_${randomUUID()}`;
	}

	private mapGender(value?: string): Gender {
		switch (value) {
			case 'male':
				return Gender.male;
			case 'female':
				return Gender.female;
			case 'other':
				return Gender.other;
			default:
				return Gender.private;
		}
	}

	private mapReferral(value?: string): ContributorReferralSource {
		switch (value) {
			case 'familyfriends':
				return ContributorReferralSource.family_and_friends;
			case 'work':
				return ContributorReferralSource.work;
			case 'socialmedia':
				return ContributorReferralSource.social_media;
			case 'media':
				return ContributorReferralSource.media;
			case 'presentation':
				return ContributorReferralSource.presentation;
			case 'other':
				return ContributorReferralSource.other;
			default:
				return ContributorReferralSource.other;
		}
	}
}
