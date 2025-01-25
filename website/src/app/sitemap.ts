import { MetadataRoute } from 'next';
import { mainWebsiteLanguages, websiteRegions } from '@/i18n';
import { BA } from 'country-flag-icons/react/1x1';
// import { BASE_URL } from '@/app/lib/constants'

export const BASE_URL = () => {
	return process.env.BASE_URL;
};

export default function sitemap(): MetadataRoute.Sitemap {
    const pages = [
        '',
        'about-us',
        'our-work'
    ]

    return pages.flatMap((page) => mainWebsiteLanguages.flatMap((lang) => websiteRegions.map((region) => ({
        url: `${BASE_URL}/${lang}/${region}/${page}`,
        lastModified: new Date(), 
    }))))
}
