import { updateSelfAction as updateContributorSelfAction } from '@/lib/server-actions/contributor-actions';
import { updateLocalPartnerAction } from '@/lib/server-actions/local-partner-action';
import { ContributorSession, ContributorUpdateInput } from '@/lib/services/contributor/contributor.types';
import { LocalPartnerSession, LocalPartnerUpdateInput } from '@/lib/services/local-partner/local-partner.types';
import { ContributorReferralSource } from '@prisma/client';
import { toggleNewsletter } from './newsletter';
import { ProfileFormValues } from './schemas';

export async function submitProfileForm(
	values: ProfileFormValues,
	session: ContributorSession | LocalPartnerSession,
	isNewsletterSubscribed: boolean,
) {
	if (session.type === 'contributor') {
		const resultNewsletter = await toggleNewsletter(values, session, isNewsletterSubscribed);
		if (!resultNewsletter.success) {
			return {
				success: false,
				error: 'error' in resultNewsletter ? resultNewsletter.error : 'Newsletter update failed',
			};
		}

		const update: ContributorUpdateInput = {
			referral: values.referral ?? session.referral ?? ContributorReferralSource.other,
			contact: {
				update: {
					data: {
						firstName: values.firstName,
						lastName: values.lastName,
						email: values.email,
						gender: values.gender ?? null,
						language: values.language,
						address: {
							upsert: {
								update: {
									street: values.street,
									number: values.number,
									city: values.city,
									zip: values.zip,
									country: values.country ?? '',
								},
								create: {
									street: values.street ?? '',
									number: values.number ?? '',
									city: values.city ?? '',
									zip: values.zip ?? '',
									country: values.country ?? '',
								},
							},
						},
					},
				},
			},
		};

		return updateContributorSelfAction(update);
	}

	const update: LocalPartnerUpdateInput = {
		name: values.name,
		causes: values.causes ?? [],
		contact: {
			update: {
				data: {
					firstName: values.firstName,
					lastName: values.lastName,
					email: values.email,
					gender: values.gender ?? null,
					language: values.language,
					address: {
						upsert: {
							update: {
								street: values.street,
								number: values.number,
								city: values.city,
								zip: values.zip,
								country: values.country ?? '',
							},
							create: {
								street: values.street ?? '',
								number: values.number ?? '',
								city: values.city ?? '',
								zip: values.zip ?? '',
								country: values.country ?? '',
							},
						},
					},
				},
			},
		},
	};

	return updateLocalPartnerAction(update);
}
