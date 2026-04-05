import { ContributorReferralSource } from '@/generated/prisma/enums';
import { updateSelfAction as updateContributorSelfAction } from '@/lib/server-actions/contributor-actions';
import { updateLocalPartnerAction } from '@/lib/server-actions/local-partner-action';
import { updateUserSelfAction } from '@/lib/server-actions/user-actions';
import { ContributorSession, ContributorUpdateInput } from '@/lib/services/contributor/contributor.types';
import { LocalPartnerFormUpdateInput } from '@/lib/services/local-partner/local-partner-form-input';
import { LocalPartnerSession } from '@/lib/services/local-partner/local-partner.types';
import { UserSession } from '@/lib/services/user/user.types';
import { toggleNewsletter } from './newsletter';
import { ProfileFormOutput } from './schemas';

export const submitProfileForm = async (
	values: ProfileFormOutput,
	session: ContributorSession | LocalPartnerSession | UserSession,
	isNewsletterSubscribed: boolean,
) => {
	if (values.type === 'contributor') {
		const resultNewsletter = await toggleNewsletter(values, session as ContributorSession, isNewsletterSubscribed);
		if (!resultNewsletter.success) {
			return {
				success: false,
				error: 'error' in resultNewsletter ? resultNewsletter.error : 'Newsletter update failed',
			};
		}

		const update: ContributorUpdateInput = {
			referral: values.referral ?? (session as ContributorSession).referral ?? ContributorReferralSource.other,
			contact: {
				update: {
					data: {
						firstName: values.firstName,
						lastName: values.lastName,
						email: values.email,
						gender: values.gender ?? null,
						language: values.language,
						address: values.address
							? {
									upsert: {
										update: values.address,
										create: values.address,
									},
								}
							: undefined,
					},
				},
			},
		};

		return updateContributorSelfAction(update);
	}

	if (values.type === 'local-partner') {
		const update: LocalPartnerFormUpdateInput = {
			name: values.name,
			focuses: values.focuses ?? [],
			contact: {
				firstName: values.firstName,
				lastName: values.lastName,
				callingName: null,
				email: values.email,
				gender: values.gender ?? null,
				language: values.language ?? null,
				dateOfBirth: null,
				profession: null,
				phone: undefined,
				hasWhatsApp: false,
				street: values.address?.street ?? null,
				number: values.address?.number ?? null,
				city: values.address?.city ?? null,
				zip: values.address?.zip ?? null,
				country: values.address?.country ?? null,
			},
		};

		return updateLocalPartnerAction(update, 'local-partner');
	}

	return updateUserSelfAction({
		firstName: values.firstName,
		lastName: values.lastName,
		gender: values.gender ?? null,
		language: values.language,
		organizationId: values.organizationId,
		address: values.address ?? undefined,
	});
};
