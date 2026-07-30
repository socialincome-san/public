import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import type { Metadata } from 'next';

export const WEBSITE_ORIGIN = 'https://socialincome.org';
export const DEFAULT_OPEN_GRAPH_IMAGE_URL = `${WEBSITE_ORIGIN}/assets/metadata/og/default.jpg`;
export const DEFAULT_TWITTER_IMAGE_URL = `${WEBSITE_ORIGIN}/assets/metadata/twitter/default.jpg`;

const BLOCKED_METADATA_HOST_PATTERNS = [/^localhost$/i, /^127(?:\.\d{1,3}){3}$/, /^0\.0\.0\.0$/, /\.vercel\.app$/i];

/*
 * Convert a metadata URL to a production URL. If the URL is invalid or blocked, return the fallback URL.
 * @param url - The metadata URL to convert
 * @param fallback - The fallback URL to return if the metadata URL is invalid or blocked
 * @returns The production URL or the fallback URL
 */
export const toProductionMetadataUrl = (url: string | null | undefined, fallback: string) => {
	const value = url?.trim();
	if (!value) {
		return fallback;
	}

	try {
		const metadataUrl = new URL(value, WEBSITE_ORIGIN);
		const isBlockedHost = BLOCKED_METADATA_HOST_PATTERNS.some((pattern) => pattern.test(metadataUrl.hostname));

		if (metadataUrl.protocol !== 'https:' || isBlockedHost) {
			return fallback;
		}

		return metadataUrl.toString();
	} catch {
		return fallback;
	}
};

/**
 * Get metadata for a page. The metadata is read from the i18n translation file. If a key is missing in the translation file,
 * the default metadata from the 'website-common' namespace is used.
 * @param language - The language to get the metadata for
 * @param namespace - The namespace to get the metadata from. If some key is not found in the namespace, it will be looked up in the 'website-common' namespace.
 * @param metadata - The metadata to merge with the default metadata
 * @returns The metadata for the website
 */
export const getMetadata = async (language: WebsiteLanguage, namespace: string, metadata?: Metadata): Promise<Metadata> => {
	const namespaces = namespace ? [namespace, 'website-common'] : ['website-common'];
	const translator = await Translator.getInstance({ language, namespaces });
	const title = translator.t('metadata.title');
	const description = translator.t('metadata.description');
	const keywords = translator.t('metadata.keywords');
	const defaultMetadata = {
		title,
		description,
		keywords,
		// If VERCEL_URL is detected: https://${process.env.VERCEL_URL} otherwise it falls back to http://localhost:${process.env.PORT || 3000}.
		// https://nextjs.org/docs/app/api-reference/functions/generate-metadata
		metadataBase: new URL(WEBSITE_ORIGIN),
		alternates: {
			canonical: '/en/int',
			languages: {
				en: '/en/int',
				de: '/de/int',
				'de-CH': '/de/ch/',
			},
		},
		openGraph: {
			title,
			description,
			images: toProductionMetadataUrl(translator.t('metadata.og-image'), DEFAULT_OPEN_GRAPH_IMAGE_URL),
		},
		twitter: {
			title,
			card: 'summary_large_image',
			site: '@so_income',
			creator: '@so_income',
			images: toProductionMetadataUrl(translator.t('metadata.twitter-image'), DEFAULT_TWITTER_IMAGE_URL),
		},
	} satisfies Metadata;

	return {
		...defaultMetadata,
		...metadata,
		alternates: {
			...defaultMetadata.alternates,
			...metadata?.alternates,
			languages: {
				...defaultMetadata.alternates.languages,
				...metadata?.alternates?.languages,
			},
		},
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
