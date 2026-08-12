import {
	allWebsiteLanguages,
	defaultLanguage,
	defaultRegion,
	type WebsiteLanguage,
	type WebsiteRegion,
} from '@/lib/i18n/utils';
import { lang, region } from 'next/root-params';

const allWebsiteRegions: WebsiteRegion[] = ['int', 'ch', 'sl'];

const isWebsiteLanguage = (value: string | undefined): value is WebsiteLanguage =>
	value !== undefined && allWebsiteLanguages.some((language) => language === value);

const isWebsiteRegion = (value: string | undefined): value is WebsiteRegion =>
	value !== undefined && allWebsiteRegions.some((websiteRegion) => websiteRegion === value);

export const getWebsiteRootParams = async (): Promise<{ lang: WebsiteLanguage; region: WebsiteRegion }> => {
	const [language, websiteRegion] = await Promise.all([lang(), region()]);

	if (!isWebsiteLanguage(language) || !isWebsiteRegion(websiteRegion)) {
		throw new Error('Website root parameters are unavailable outside a localized website route.');
	}

	return { lang: language, region: websiteRegion };
};

export const getWebsiteShellLocale = async (
	localized: boolean,
): Promise<{ lang: WebsiteLanguage; region: WebsiteRegion }> =>
	localized ? getWebsiteRootParams() : { lang: defaultLanguage, region: defaultRegion };
