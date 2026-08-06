import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import type { Metadata } from 'next';

export const WEBSITE_ORIGIN = 'https://socialincome.org';
export const DEFAULT_OPEN_GRAPH_IMAGE_URL = `${WEBSITE_ORIGIN}/assets/metadata/og/default.jpg`;
export const DEFAULT_TWITTER_IMAGE_URL = DEFAULT_OPEN_GRAPH_IMAGE_URL;

const BLOCKED_METADATA_HOST_PATTERNS = [/^localhost$/i, /\.localhost$/i, /^vercel\.app$/i, /\.vercel\.app$/i];

const getIpv4Parts = (hostname: string) => {
	const parts = hostname.split('.');
	if (parts.length !== 4) {
		return null;
	}

	const numbers = parts.map((part) => Number(part));
	if (numbers.some((part, index) => !Number.isInteger(part) || part < 0 || part > 255 || String(part) !== parts[index])) {
		return null;
	}

	return numbers as [number, number, number, number];
};

const isBlockedIpv4Host = (hostname: string) => {
	const parts = getIpv4Parts(hostname);
	if (!parts) {
		return false;
	}

	const [first, second] = parts;

	return (
		first === 0 ||
		first === 10 ||
		first === 127 ||
		(first === 169 && second === 254) ||
		(first === 172 && second >= 16 && second <= 31) ||
		(first === 192 && second === 168)
	);
};

const getIpv4FromMappedIpv6 = (hostname: string) => {
	const mappedIpv6Prefix = '::ffff:';
	if (!hostname.startsWith(mappedIpv6Prefix)) {
		return null;
	}

	const parts = hostname.slice(mappedIpv6Prefix.length).split(':');
	if (parts.length !== 2) {
		return null;
	}

	const high = Number.parseInt(parts[0], 16);
	const low = Number.parseInt(parts[1], 16);
	if (!Number.isInteger(high) || !Number.isInteger(low) || high < 0 || high > 0xffff || low < 0 || low > 0xffff) {
		return null;
	}

	return `${(high >> 8) & 0xff}.${high & 0xff}.${(low >> 8) & 0xff}.${low & 0xff}`;
};

const isBlockedIpv6Host = (hostname: string) => {
	const ipv6Host = hostname.replace(/^\[|\]$/g, '').toLowerCase();
	if (!ipv6Host.includes(':')) {
		return false;
	}

	const mappedIpv4 = getIpv4FromMappedIpv6(ipv6Host);
	if (mappedIpv4) {
		return isBlockedIpv4Host(mappedIpv4);
	}

	const firstSegment = ipv6Host.split(':')[0] ?? '';
	const firstHextet = Number.parseInt(firstSegment, 16);

	return (
		ipv6Host === '::' ||
		ipv6Host === '::1' ||
		(Number.isInteger(firstHextet) && firstHextet >= 0xfc00 && firstHextet <= 0xfdff) ||
		(Number.isInteger(firstHextet) && firstHextet >= 0xfe80 && firstHextet <= 0xfebf)
	);
};

const isBlockedMetadataHost = (hostname: string) => {
	const normalizedHostname = hostname.toLowerCase().replace(/\.$/, '');

	return (
		BLOCKED_METADATA_HOST_PATTERNS.some((pattern) => pattern.test(normalizedHostname)) ||
		isBlockedIpv4Host(normalizedHostname) ||
		isBlockedIpv6Host(normalizedHostname)
	);
};

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

		if (metadataUrl.protocol !== 'https:' || isBlockedMetadataHost(metadataUrl.hostname)) {
			return fallback;
		}

		return metadataUrl.toString();
	} catch {
		return fallback;
	}
};

export type MetadataImage = { url: string; width?: number; height?: number; alt?: string };

export const toProductionMetadataImage = (imageMetadata: MetadataImage | null | undefined, fallback: string) => {
	if (!imageMetadata) {
		return fallback;
	}

	const url = toProductionMetadataUrl(imageMetadata.url, fallback);

	return url === fallback ? fallback : { ...imageMetadata, url };
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
		// Resolve relative metadata URLs against the production origin.
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
