import { ContributorReferralSource, Gender } from '@prisma/client';
import { BaseTransformer } from '../core/base.transformer';
import { ContributorCreateInput, FirestoreContributorWithId } from './contributor.types';

export class ContributorTransformer extends BaseTransformer<FirestoreContributorWithId, ContributorCreateInput> {
	private manualIdCounter = 1;

	transform = async (input: FirestoreContributorWithId[]): Promise<ContributorCreateInput[]> => {
		const transformed: ContributorCreateInput[] = [];
		let skipped = 0;
		let generatedManualIds = 0;

		for (const doc of input) {
			if (doc.test_user) {
				skipped++;
				continue;
			}

			const { personal, address } = doc;
			const email = doc.email.toLowerCase();

			let authId: string;
			if (doc.auth_user_id) {
				authId = doc.auth_user_id;
			} else {
				authId = this.generateManualAuthId(); // Todo: create real auth users and remove authuser-creation form login.
				generatedManualIds++;
			}

			transformed.push({
				firebaseAuthUserId: authId,
				contributor: {
					create: {
						legacyFirestoreId: doc.id,
						createdAt: doc.created_at?.toDate() ?? doc.last_updated_at?.toDate() ?? undefined,
						referral: this.mapReferral(personal?.referral),
						paymentReferenceId: doc.payment_reference_id?.toString() ?? null,
						stripeCustomerId: doc.stripe_customer_id ?? null,
						needsOnboarding: doc.auth_user_id ? false : true,
						contact: {
							create: {
								firstName: personal?.name ?? '',
								lastName: personal?.lastname ?? '',
								email,
								gender: this.mapGender(personal?.gender),
								language: doc.language ?? null,
								isInstitution: doc.institution ?? false,
								address: address
									? {
											create: {
												street: address.street ?? '',
												number: address.number ?? '',
												city: address.city ?? '',
												zip: address.zip?.toString() ?? '',
												country: address.country ?? '',
											},
										}
									: undefined,
							},
						},
					},
				},
			});
		}

		if (skipped > 0) {
			console.log(`⚠️ Skipped ${skipped} test contributors`);
		}

		if (generatedManualIds > 0) {
			console.log(`🆔 Generated ${generatedManualIds} manual auth IDs`);
		}

		return transformed;
	};

	private generateManualAuthId(): string {
		return `manual_${this.manualIdCounter++}`;
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
