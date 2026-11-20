import { getWebsiteRelativePathFromStoryblokSlug } from '@/lib/storyblok/storyblok-paths';

// Not in shared-resolvers.tsx, a client module, so server components such as PersonBio can call it
export const resolveRichTextHref = (href: string) => {
	const match = href.match(/^(https?:\/\/[^/]+)?\/?(pages\/.*)$/);

	return match ? `${match[1] ?? ''}${getWebsiteRelativePathFromStoryblokSlug(match[2])}` : href;
};
