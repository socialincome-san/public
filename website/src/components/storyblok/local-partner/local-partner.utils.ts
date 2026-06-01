import type { LocalPartner } from '@/generated/storyblok/types/109655/storyblok-components';
import type { StoryblokRichtext } from '@/generated/storyblok/types/storyblok';
import type { LocalPartnerStory } from './local-partner.types';

const storyblokRichtextToPlainText = (node: StoryblokRichtext): string => {
	if (node.text !== undefined) {
		return node.text;
	}

	return node.content?.map(storyblokRichtextToPlainText).join(' ') ?? '';
};

export const getLocalPartnerId = (localPartner: LocalPartner) => {
	const id = (localPartner as { id?: unknown }).id;

	return typeof id === 'string' ? id.trim() : '';
};

export const getLocalPartnerDescription = (localPartner: LocalPartner) =>
	storyblokRichtextToPlainText(localPartner.description).replaceAll(/\s+/g, ' ').trim();

export const getLocalPartnerSlug = (localPartner: LocalPartnerStory) => {
	const fullSlugTail = localPartner.full_slug?.split('/').at(-1);

	return fullSlugTail ?? localPartner.slug;
};

export const getLocalPartnerTitle = (localPartner: LocalPartner) => {
	return localPartner.title.trim() || getLocalPartnerId(localPartner);
};
