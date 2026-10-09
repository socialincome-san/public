import { type Messages } from '@/lib/i18n/messages';
import { defaultCurrency, defaultLanguage, mainWebsiteLanguages, WebsiteLanguage } from '@/lib/i18n/utils';
import { getWebsitePublicPath } from '@/lib/storyblok/storyblok-paths';
import { Metadata } from 'next';
import { getMessages } from 'next-intl/server';

type MetadataKey = keyof Messages['website-common']['metadata'];

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

/**
 * Get metadata for a page. The metadata is read from the i18n translation file. If a key is missing in the translation file,
 * the default metadata from the 'website-common' namespace is used.
 * @param language - The language to get the metadata for
 * @param namespace - The namespace to get the metadata from. If some key is not found in the namespace, it will be looked up in the 'website-common' namespace.
 * @param metadata - The metadata to merge with the default metadata
 * @returns The metadata for the website
 */
export const getMetadata = async (
	language: WebsiteLanguage,
	namespace: keyof Messages,
	metadata?: Metadata,
): Promise<Metadata> => {
	const messages = await getMessages({ locale: language });
	const translate = (key: MetadataKey): string => {
		const namespaceMessages: unknown = messages[namespace];
		const value =
			isRecord(namespaceMessages) && isRecord(namespaceMessages.metadata) ? namespaceMessages.metadata[key] : undefined;

		return typeof value === 'string' ? value : messages['website-common'].metadata[key];
	};
	const title = translate('title');
	const description = translate('description');
	const keywords = translate('keywords');
	const defaultMetadata = {
		title,
		description,
		keywords,
		// If VERCEL_URL is detected: https://${process.env.VERCEL_URL} otherwise it falls back to http://localhost:${process.env.PORT || 3000}.
		// https://nextjs.org/docs/app/api-reference/functions/generate-metadata
		metadataBase: null,
		openGraph: {
			title,
			description,
			images: translate('og-image'),
		},
		twitter: {
			title,
			card: 'summary_large_image',
			site: '@so_income',
			creator: '@so_income',
			images: translate('twitter-image'),
		},
	} satisfies Metadata;

	return {
		...defaultMetadata,
		...metadata,
		openGraph: {
			...defaultMetadata.openGraph,
			...metadata?.openGraph,
		},
		twitter: {
			...defaultMetadata.twitter,
			...metadata?.twitter,
		},
	};
};

/**
 * Currency variants of a page differ only in how amounts are shown, so every variant names the default
 * currency's URL as canonical. hreflang lists languages only: currencies are not regions.
 */
export const getWebsiteAlternates = (lang: WebsiteLanguage, pathTail: string): Metadata => {
	const path = (language: WebsiteLanguage) => getWebsitePublicPath(language, defaultCurrency, pathTail);

	return {
		alternates: {
			canonical: path(lang),
			languages: {
				...Object.fromEntries(mainWebsiteLanguages.map((language) => [language, path(language)])),
				'x-default': path(defaultLanguage),
			},
		},
	};
};
