import { ContributorReferralSource } from '@/generated/prisma/enums';
import { slugify } from '@/lib/utils/string-utils';
import { updateContributorSelfAction } from '@/modules/contributors/contributor.actions';
import type { UpdateContributorSelfInput } from '@/modules/contributors/contributor.schemas';
import { ContributorSession } from '@/modules/contributors/contributor.types';
import { updateLocalPartnerAction } from '@/modules/local-partners/local-partner.actions';
import type { LocalPartnerUpdateInput } from '@/modules/local-partners/local-partner.schemas';
import type { LocalPartnerSession } from '@/modules/local-partners/local-partner.types';
import { updateUserSelfAction } from '@/modules/users/user.actions';
import type { UserSession } from '@/modules/users/user.types';
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

		const update: UpdateContributorSelfInput = {
			referral: values.referral ?? (session as ContributorSession).referral ?? ContributorReferralSource.other,
			contact: {
				firstName: values.firstName,
				lastName: values.lastName,
				email: values.email,
				gender: values.gender ?? null,
				language: values.language,
				address: values.address,
			},
		};

		return updateContributorSelfAction(update);
	}

	if (values.type === 'local-partner') {
		const update: LocalPartnerUpdateInput = {
			name: values.name,
			slug: slugify(values.name),
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
