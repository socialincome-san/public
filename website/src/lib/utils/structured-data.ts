import { WEBSITE_ORIGIN } from '@/lib/utils/metadata-image';

const organization = {
	'@type': 'NGO',
	'@id': `${WEBSITE_ORIGIN}/#organization`,
	name: 'Social Income',
	url: WEBSITE_ORIGIN,
	logo: `${WEBSITE_ORIGIN}/assets/logos_si/logo_color@2x.png`,
};

export const getOrganizationStructuredData = (sameAs: string[]) => ({
	'@context': 'https://schema.org',
	...organization,
	...(sameAs.length > 0 ? { sameAs } : {}),
});

export const getArticleStructuredData = (article: {
	url: string;
	headline: string;
	description?: string;
	image: string;
	datePublished: string;
	dateModified: string;
	author: { name: string; url: string };
}) => ({
	'@context': 'https://schema.org',
	'@type': 'Article',
	mainEntityOfPage: article.url,
	headline: article.headline,
	...(article.description ? { description: article.description } : {}),
	image: [article.image],
	...(article.datePublished ? { datePublished: article.datePublished } : {}),
	...(article.dateModified ? { dateModified: article.dateModified } : {}),
	author: { '@type': 'Person', ...article.author },
	publisher: organization,
});
