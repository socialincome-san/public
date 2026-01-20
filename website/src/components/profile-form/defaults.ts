import { WebsiteLanguage } from '@/lib/i18n/utils';
import { ContributorSession } from '@/lib/services/contributor/contributor.types';
import { LocalPartnerSession } from '@/lib/services/local-partner/local-partner.types';
import { UserSession } from '@/lib/services/user/user.types';
import { ProfileFormValues } from './schemas';

export function buildDefaultValues(
	session: ContributorSession | LocalPartnerSession | UserSession,
	isNewsletterSubscribed?: boolean,
): ProfileFormValues {
	if (session.type === 'contributor') {
		return {
			type: 'contributor',
			firstName: session.firstName ?? '',
			lastName: session.lastName ?? '',
			email: session.email ?? '',
			country: session.country ?? '',
			language: (session.language ?? 'en') as WebsiteLanguage,
			gender: session.gender ?? undefined,
			referral: session.referral ?? undefined,
			street: session.street ?? '',
			number: session.number ?? '',
			city: session.city ?? '',
			zip: session.zip ?? '',
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
			country: session.country ?? '',
			language: (session.language ?? 'en') as WebsiteLanguage,
			gender: session.gender ?? undefined,
			street: session.street ?? '',
			number: session.number ?? '',
			city: session.city ?? '',
			zip: session.zip ?? '',
		};
	}

	return {
		type: 'user',
		firstName: session.firstName ?? '',
		lastName: session.lastName ?? '',
		email: session.email ?? '',
		country: session.country ?? '',
		language: (session.language ?? 'en') as WebsiteLanguage,
		gender: session.gender ?? undefined,
		street: session.street ?? '',
		number: session.number ?? '',
		city: session.city ?? '',
		zip: session.zip ?? '',
	};
}
