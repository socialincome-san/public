import type { LocalPartner } from '@/generated/storyblok/types/109655/storyblok-components';
import type { LocalPartnerStory } from './local-partner.types';

export const getLocalPartnerId = (localPartner: LocalPartner) => {
	return localPartner.id.trim();
};

export const getLocalPartnerDescription = (localPartner: LocalPartner) => {
	return localPartner.description.trim();
};

export const getLocalPartnerSlug = (localPartner: LocalPartnerStory) => {
	const fullSlugTail = localPartner.full_slug?.split('/').at(-1);

	return fullSlugTail ?? localPartner.slug;
};

export const getLocalPartnerTitle = (localPartner: LocalPartner) => {
	return localPartner.title.trim() || getLocalPartnerId(localPartner);
};
