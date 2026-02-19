import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import _ from 'lodash';
import { Metadata } from 'next';

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
    metadataBase: null,
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
      images: translator.t('metadata.og-image'),
    },
    twitter: {
      title,
      card: 'summary_large_image',
      site: '@so_income',
      creator: '@so_income',
      images: translator.t('metadata.twitter-image'),
    },
  };

  return _.merge(defaultMetadata, metadata);
};
