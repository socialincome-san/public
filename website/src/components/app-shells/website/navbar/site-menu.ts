import { DONATE_LINK_ID, toSiteMenuEntries } from '@/components/app-shells/website/navbar/utils';
import { getCountryIsoCode, getCountrySlug, getCountryTitle } from '@/components/storyblok/country/country.utils';
import type { Layout, MenuItem } from '@/generated/storyblok/types/109655/storyblok-components';
import { getSafeNumberFormatLocale, getWebsiteBasePath, type WebsiteCurrency, type WebsiteLanguage } from '@/lib/i18n/utils';
import { type Result } from '@/lib/result';
import { resolveStoryblokLink } from '@/lib/storyblok/storyblok-utils';
import { formatCurrencyLocale, formatNumberLocale } from '@/lib/utils/string-utils';
import { getContributorCommunityStatsAction } from '@/modules/contributors/contributor.actions';
import { getPublicCountryStatsByIsoCodesAction } from '@/modules/countries/country.actions';
import { resolveChfAmountsAction } from '@/modules/currency-display/currency-display.actions';
import {
	getAllPersonsAction,
	getCountriesAction,
	getFocusesAction,
	getLocalPartnersAction,
	getProgramsAction,
} from '@/modules/storyblok-content/storyblok-content.actions';
import { getTransparencySummaryAction } from '@/modules/transparency/transparency.actions';
import {
	type SiteMenuEntry,
	type SiteMenuGroup,
	type SiteMenuLink,
} from '@socialincome/design-system/navigation/site-header/site-header';
import { getTranslations } from 'next-intl/server';

// Keeps all dropdowns the same height
const MAX_LINKS_PER_GROUP = 4;

const ORGANISATION_PATHS = ['about-us', 'people', 'our-work', 'why-cash-transfers'];
const TRANSPARENCY_PATHS = ['impact-measurement', 'transparency', 'open-source', 'downloads', 'faq'];

type CountKey =
	| 'programs-count'
	| 'focuses-count'
	| 'partners-count'
	| 'donors-count'
	| 'ngos-count'
	| 'volunteers-count'
	| 'recipients-count';

const countOf = (result: Result<unknown[]>) => (result.success ? result.data.length : 0);

/**
 * Who we support · Get involved · About · Journal. Built in code until the structure moves into the Storyblok layout;
 * the Storyblok menu still provides the program, focus, partner and about links.
 */
export const getSiteMenuEntries = async (
	layout: Layout | undefined,
	lang: WebsiteLanguage,
	currency: WebsiteCurrency,
): Promise<SiteMenuEntry[]> => {
	const [t, programs, focuses, localPartners, persons, countries, communityStats, transparency] = await Promise.all([
		getTranslations('website-common'),
		getProgramsAction(lang),
		getFocusesAction(lang),
		getLocalPartnersAction(lang),
		getAllPersonsAction(lang),
		getCountriesAction(lang),
		getContributorCommunityStatsAction(),
		getTransparencySummaryAction(),
	]);
	const countryStories = countries.success ? countries.data : [];
	const [countryStats, paidOut] = await Promise.all([
		getPublicCountryStatsByIsoCodesAction(countryStories.map((country) => getCountryIsoCode(country.content))),
		transparency.success
			? resolveChfAmountsAction({ amounts: [transparency.data.financialSummary.outflowsChf], displayCurrency: currency })
			: undefined,
	]);

	const locale = getSafeNumberFormatLocale(lang);
	const count = (value: number) => formatNumberLocale(value, locale);
	const badge = (key: CountKey, value: number) => (value > 0 ? t(`site-menu.${key}`, { count: count(value) }) : undefined);
	const basePath = getWebsiteBasePath(lang, currency);
	const link = (id: string, label: string, path: string): SiteMenuLink => ({ id, label, href: `${basePath}/${path}` });

	const recipientsByCountry = countryStats.success ? countryStats.data : {};
	const recipientsCount = Object.values(recipientsByCountry).reduce((total, stats) => total + stats.recipientsCount, 0);
	const paidOutAmount = paidOut?.success ? paidOut.data[0] : undefined;

	const menu = layout?.menu ?? [];
	const storyblokGroups = menu.flatMap((item) => (item.component === 'dropdownItem' ? item.menuItemGroups : []));

	const toLink = (item: MenuItem): SiteMenuLink => ({
		id: item._uid,
		label: item.label ?? '',
		href: resolveStoryblokLink(item.link, lang, currency),
		newTab: item.newTab,
	});
	// The footer menu also holds pages the header menu lacks, e.g. policies
	const allStoryblokLinks = [...storyblokGroups, ...(layout?.footerMenu ?? [])].flatMap((group) =>
		(group.items ?? []).map(toLink),
	);
	const storyblokLinks = (paths: string[]) =>
		paths.flatMap((path) => allStoryblokLinks.find((candidate) => candidate.href === `${basePath}/${path}`) ?? []);
	// Storyblok groups are identified by the page their overview link points to
	const listGroup = (overviewPath: string, total: number, badgeKey: CountKey, label?: string): SiteMenuGroup[] => {
		const group = storyblokGroups.find(
			(candidate) => resolveStoryblokLink(candidate.overviewLink, lang, currency) === `${basePath}/${overviewPath}`,
		);

		return group?.items?.length
			? [
					{
						id: group._uid,
						label: label ?? group.label,
						badge: badge(badgeKey, total),
						links: group.items.slice(0, MAX_LINKS_PER_GROUP).map(toLink),
						overview: {
							label: total > 0 ? t('site-menu.show-all', { count: count(total) }) : (group.overviewLabel ?? ''),
							href: `${basePath}/${overviewPath}`,
						},
					},
				]
			: [];
	};

	const whoWeSupport: SiteMenuEntry = {
		type: 'dropdown',
		id: 'who-we-support',
		label: t('site-menu.who-we-support'),
		groups: [
			...listGroup('programs', countOf(programs), 'programs-count', t('site-menu.programs')),
			...listGroup('focuses', countOf(focuses), 'focuses-count'),
			...listGroup('local-partners', countOf(localPartners), 'partners-count'),
		],
		footer: {
			label: recipientsCount > 0 ? t('site-menu.recipients-in', { count: count(recipientsCount) }) : undefined,
			countries: countryStories
				.map((country) => {
					const isoCode = getCountryIsoCode(country.content).toUpperCase();

					return { country, isoCode, recipients: recipientsByCountry[isoCode]?.recipientsCount ?? 0 };
				})
				.sort((a, b) => b.recipients - a.recipients)
				.map(({ country, isoCode, recipients }) => ({
					id: country.uuid,
					country: isoCode,
					label: `${getCountryTitle(country.content)} (${count(recipients)})`,
					href: `${basePath}/countries/${getCountrySlug(country)}`,
				})),
			overview: { label: t('site-menu.all-countries'), href: `${basePath}/countries` },
		},
	};

	const getInvolved: SiteMenuEntry = {
		type: 'dropdown',
		id: 'get-involved',
		label: t('site-menu.get-involved'),
		groups: [
			{
				id: 'individual',
				label: t('site-menu.individual'),
				badge: badge('donors-count', communityStats.success ? communityStats.data.supporterCount : 0),
				illustrationSrc: '/assets/get-involved/role-individual-bike.png',
				links: [
					// Without the donation dialog (mobile), the home page with its donation form is the fallback
					link(DONATE_LINK_ID, t('site-menu.items.donate'), ''),
					link('fundraise', t('site-menu.items.fundraise'), 'fundraise'),
					link('start-program', t('site-menu.items.start-program'), 'start-program?for=individual'),
					link('volunteer', t('site-menu.items.volunteer'), 'open-source'),
					link('campaigns', t('site-menu.items.campaigns'), 'campaigns'),
				],
			},
			{
				id: 'company',
				label: t('site-menu.company'),
				illustrationSrc: '/assets/get-involved/role-company-yellow-screen.png',
				links: [
					link(DONATE_LINK_ID, t('site-menu.items.company-donate'), ''),
					link('fundraise', t('site-menu.items.company-fundraise'), 'fundraise'),
					link('start-program', t('site-menu.items.start-program'), 'start-program?for=company'),
					link('presentation', t('site-menu.items.presentation'), 'contact'),
				],
			},
			{
				id: 'ngo',
				label: t('site-menu.ngo'),
				// The NGOs we work with are our local partners
				badge: badge('ngos-count', countOf(localPartners)),
				illustrationSrc: '/assets/get-involved/role-ngo-tailoring.png',
				links: [
					link('start-program', t('site-menu.items.start-program'), 'start-program?for=ngo'),
					link('local-partner', t('site-menu.items.local-partner'), 'local-partners'),
				],
			},
		],
		footer: { overview: { label: t('site-menu.all-ways'), href: `${basePath}/get-involved` } },
	};

	const about: SiteMenuEntry = {
		type: 'dropdown',
		id: 'about',
		label: t('site-menu.about'),
		groups: [
			{
				id: 'organisation',
				label: 'Social Income',
				badge: badge('volunteers-count', countOf(persons)),
				links: [...storyblokLinks(ORGANISATION_PATHS), link('contact', t('site-menu.contact'), 'contact')],
			},
			{
				id: 'how-we-work',
				label: t('site-menu.how-we-work'),
				badge: badge('recipients-count', recipientsCount),
				links: [
					...storyblokLinks(['recipient-selection']),
					link('do-no-harm', t('site-menu.do-no-harm'), 'do-no-harm'),
					link('mobile-money', t('site-menu.mobile-money'), 'mobile-money'),
					link('recipient-app', t('site-menu.recipient-app'), 'mobile-app'),
					...storyblokLinks(['policies']),
				],
			},
			{
				id: 'transparency',
				label: t('site-menu.transparency-impact'),
				badge:
					paidOutAmount &&
					t('site-menu.paid-out', {
						amount: formatCurrencyLocale(paidOutAmount.amount, paidOutAmount.currency, locale, {
							compactThreshold: 1_000_000,
							compactLocale: locale,
						}),
					}),
				links: storyblokLinks(TRANSPARENCY_PATHS),
			},
		].filter((group) => group.links.length > 0),
		footer: {
			label: t('site-menu.newsletter-teaser'),
			overview: { label: t('site-menu.newsletter-cta'), href: `${basePath}/newsletter` },
		},
	};

	const links = toSiteMenuEntries(menu, lang, currency).filter((entry) => entry.type === 'link');

	return [whoWeSupport, getInvolved, about, ...links];
};
