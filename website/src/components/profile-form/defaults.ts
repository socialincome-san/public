import { WebsiteLanguage } from '@/lib/i18n/utils';
import { ContributorSession } from '@/lib/services/contributor/contributor.types';
import { LocalPartnerSession } from '@/lib/services/local-partner/local-partner.types';
import { UserSession } from '@/lib/services/user/user.types';
import { ProfileFormInput } from './schemas';

export const buildDefaultValues = (
	session: ContributorSession | LocalPartnerSession | UserSession,
	isNewsletterSubscribed?: boolean,
): ProfileFormInput => {
	const address = {
		country: session.country ?? null,
		street: session.street ?? '',
		number: session.number ?? '',
		city: session.city ?? '',
		zip: session.zip ?? '',
	};

	if (session.type === 'contributor') {
		return {
			type: 'contributor',
			firstName: session.firstName ?? '',
			lastName: session.lastName ?? '',
			email: session.email ?? '',
			language: (session.language ?? 'en') as WebsiteLanguage,
			gender: session.gender ?? undefined,
			referral: session.referral ?? undefined,
			address: address,
			newsletter: isNewsletterSubscribed ?? false,
		};
	}

	if (session.type === 'local-partner') {
		return {
			type: 'local-partner',
			name: session.name ?? '',
			causes: session.causes ?? [],
			firstName: session.firstName ?? '',
			lastName: session.lastName ?? '',
			email: session.email ?? '',
			language: (session.language ?? 'en') as WebsiteLanguage,
			gender: session.gender ?? undefined,
			address,
		};
	}

	return {
		type: 'user',
		organizationId: session.activeOrganization?.id ?? '',
		firstName: session.firstName ?? '',
		lastName: session.lastName ?? '',
		email: session.email ?? '',
		language: (session.language ?? 'en') as WebsiteLanguage,
		gender: session.gender ?? undefined,
		address,
	};
}
