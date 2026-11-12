import type { DefaultLayoutProps, DefaultPageProps } from '@/app/[lang]/[currency]';
import { getPageMetadata } from '@/app/[lang]/[currency]/page-metadata';
import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { CountryEligibilityIntro } from '@/components/country-eligibility/country-eligibility-intro';
import { CountryEligibilityTable } from '@/components/country-eligibility/country-eligibility-table';
import { getCountryPageHrefs } from '@/components/country-eligibility/country-page-hrefs';
import { getWebsiteBasePath, toWebsiteCurrency, type WebsiteLanguage } from '@/lib/i18n/utils';
import { createWebsitePersonLink, getPersonAvatarSrc, getPersonDisplayName } from '@/lib/storyblok/storyblok-utils';
import { getCountryEligibility } from '@/modules/countries/country.cache';
import { getPerson } from '@/modules/storyblok-content/storyblok-content.cache';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

// The person story of whoever maintains the eligibility data
const DATA_CONTACT_SLUG = 'marc-werner';

export const generateMetadata = async ({ params }: DefaultLayoutProps) => {
	const lang = (await params).lang as WebsiteLanguage;
	const t = await getTranslations({ locale: lang, namespace: 'create-program-wizard' });

	return getPageMetadata(lang, 'open-research/country-eligibility', {
		title: t('country_eligibility_page.title'),
		description: t('country_eligibility_page.description'),
	});
};

export default async function CountryEligibilityPage({ params }: DefaultPageProps) {
	const { lang, currency } = await params;
	const websiteCurrency = toWebsiteCurrency(currency);
	const [t, tCommon, result, countryPageHrefs, contactResult] = await Promise.all([
		getTranslations('create-program-wizard'),
		getTranslations('website-common'),
		getCountryEligibility(),
		getCountryPageHrefs(lang as WebsiteLanguage, websiteCurrency),
		getPerson(DATA_CONTACT_SLUG, lang),
	]);

	if (!result.success) {
		notFound();
	}

	return (
		<BlockWrapper marginTop="none">
			<div className="space-y-10 pt-9">
				{/* "Open research" has no page of its own yet, so its crumb is plain text */}
				<Breadcrumb
					layout="inline"
					links={[
						{ href: getWebsiteBasePath(lang, websiteCurrency), label: tCommon('breadcrumb.home') },
						{ label: t('country_eligibility_page.open_research') },
						{ label: t('country_eligibility_page.title') },
					]}
				/>
				<CountryEligibilityIntro
					rows={result.data}
					contact={
						contactResult.success
							? {
									name: getPersonDisplayName(contactResult.data),
									href: createWebsitePersonLink(contactResult.data.slug, lang, websiteCurrency),
									imageSrc: getPersonAvatarSrc(contactResult.data) ?? undefined,
								}
							: undefined
					}
				/>
				<CountryEligibilityTable rows={result.data} countryPageHrefs={countryPageHrefs} />
			</div>
		</BlockWrapper>
	);
}
