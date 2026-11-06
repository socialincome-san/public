import { DONATE_LINK_IDS, toSiteMenuEntries } from '@/components/app-shells/website/navbar/utils';
import type { DropdownItem, Layout, MenuItem, MenuItemGroup } from '@/generated/storyblok/types/109655/storyblok-components';
import { getSafeNumberFormatLocale, getWebsiteBasePath, type WebsiteCurrency, type WebsiteLanguage } from '@/lib/i18n/utils';
import { resolveStoryblokLink } from '@/lib/storyblok/storyblok-utils';
import { formatCurrencyLocale, formatNumberLocale } from '@/lib/utils/string-utils';
import { getContributorCommunityStatsAction } from '@/modules/contributors/contributor.actions';
import { getPublicCountryStatsByIsoCodesAction } from '@/modules/countries/country.actions';
import { resolveChfAmountsAction } from '@/modules/currency-display/currency-display.actions';
import {
	getAllPersonsAction,
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

type Link = MenuItem['link'];

const PROGRAMS_OVERVIEW = 'pages/programs/programs';
const COUNTRIES_OVERVIEW = 'pages/countries/countries';
const FOCUSES_OVERVIEW = 'pages/focuses/focuses';
const LOCAL_PARTNERS_OVERVIEW = 'pages/local-partners/local-partners';

const ORGANISATION_SLUGS = ['pages/about-us', 'pages/mission', 'pages/people', 'pages/our-work', 'pages/why-cash-transfers'];
const TRANSPARENCY_SLUGS = [
	'pages/impact-measurement',
	'pages/transparency',
	'pages/open-source',
	'pages/downloads',
	'pages/faq',
];
const RECIPIENT_SELECTION_SLUG = 'pages/recipient-selection';
const POLICIES_SLUG = 'pages/policies';

/** Columns are capped so every dropdown keeps the same height. */
const MAX_LINKS_PER_GROUP = 4;

// Storyblok menu links carry no ISO code
const COUNTRY_CODES_BY_SLUG: Record<string, string> = {
	'pages/countries/sierra-leone': 'SL',
	'pages/countries/liberia': 'LR',
	'pages/countries/ghana': 'GH',
};

const GET_INVOLVED_ILLUSTRATIONS = {
	individual: '/assets/get-involved/role-individual-bike.png',
	company: '/assets/get-involved/role-company-yellow-screen.png',
	ngo: '/assets/get-involved/role-ngo-tailoring.png',
};

/** Storyblok full slug without leading slash or language prefix, e.g. "pages/faq". */
const toSlug = (link: Link): string =>
	(link?.cached_url ?? '')
		.replace(/^\/+/, '')
		.replace(/^[a-z]{2}\//i, '')
		.replace(/\/+$/, '');

const isDropdownItem = (item: Layout['menu'][number]): item is DropdownItem => item.component === 'dropdownItem';

const findGroup = (groups: MenuItemGroup[], overviewSlug: string) =>
	groups.find((group) => toSlug(group.overviewLink) === overviewSlug);

const pickItems = (items: MenuItem[], slugs: string[]): MenuItem[] =>
	slugs.flatMap((slug) => items.find((item) => toSlug(item.link) === slug) ?? []);

/**
 * Who we support · Get involved · About us · Journal. Reuses the Storyblok menu (programs, countries,
 * focuses, local partners, about pages) and regroups it, so these links point to existing pages.
 */
export const buildSiteMenuEntries = async (
	layout: Layout | undefined,
	lang: WebsiteLanguage,
	currency: WebsiteCurrency,
): Promise<SiteMenuEntry[]> => {
	const [t, programs, focuses, localPartners, persons, countryStats, communityStats, transparency] = await Promise.all([
		getTranslations('website-common'),
		getProgramsAction(lang),
		getFocusesAction(lang),
		getLocalPartnersAction(lang),
		getAllPersonsAction(lang),
		getPublicCountryStatsByIsoCodesAction(Object.values(COUNTRY_CODES_BY_SLUG)),
		getContributorCommunityStatsAction(),
		getTransparencySummaryAction(),
	]);
	const paidOut = transparency.success
		? await resolveChfAmountsAction({ amounts: [transparency.data.financialSummary.outflowsChf], displayCurrency: currency })
		: undefined;

	const locale = getSafeNumberFormatLocale(lang);
	const formatCount = (count: number) => formatNumberLocale(count, locale);
	const withCount = (count: number | undefined, label: (formatted: string) => string) =>
		count ? label(formatCount(count)) : undefined;
	const countOf = <T>(result: { success: true; data: T[] } | { success: false }) =>
		result.success && result.data.length > 0 ? result.data.length : undefined;
	const programsCount = countOf(programs);
	const focusesCount = countOf(focuses);
	const localPartnersCount = countOf(localPartners);
	const volunteersCount = countOf(persons);
	const recipientsByCountry = countryStats.success ? countryStats.data : {};
	const recipientsCount =
		Object.values(recipientsByCountry).reduce((total, stats) => total + stats.recipientsCount, 0) || undefined;
	const donorsCount = communityStats.success ? communityStats.data.supporterCount || undefined : undefined;
	const paidOutAmount = paidOut?.success ? paidOut.data[0] : undefined;

	const href = (path: string) => `${getWebsiteBasePath(lang, currency)}/${path}`;
	const link = (id: string, label: string, path: string): SiteMenuLink => ({ id, label, href: href(path) });

	// Storyblok groups, converted with the same rules as the plain menu
	const menu = layout?.menu ?? [];
	const storyblokGroups = menu.flatMap((item) => (isDropdownItem(item) ? item.menuItemGroups : []));
	const toGroup = (group: MenuItemGroup): SiteMenuGroup | undefined => {
		const entry = toSiteMenuEntries(
			[{ component: 'dropdownItem', _uid: group._uid, label: group.label, menuItemGroups: [group] }],
			lang,
			currency,
		)[0];

		return entry?.type === 'dropdown' ? entry.groups[0] : undefined;
	};
	const listGroup = (
		overviewSlug: string,
		subtitle: string | undefined,
		count: number | undefined,
		label?: string,
	): SiteMenuGroup | undefined => {
		const storyblokGroup = findGroup(storyblokGroups, overviewSlug);
		const group = storyblokGroup && toGroup(storyblokGroup);

		return group
			? {
					...group,
					label: label ?? group.label,
					subtitle,
					links: group.links.slice(0, MAX_LINKS_PER_GROUP),
					overview:
						group.overview && count ? { ...group.overview, label: t('site-menu.show-all', { count }) } : group.overview,
				}
			: undefined;
	};
	const toLinks = (items: MenuItem[]): SiteMenuLink[] =>
		items.map((item) => ({
			id: item._uid,
			label: item.label ?? '',
			href: resolveStoryblokLink(item.link, lang, currency),
			newTab: item.newTab,
		}));
	// The footer menu also holds pages the header menu lacks, e.g. policies
	const storyblokItems = [...storyblokGroups, ...(layout?.footerMenu ?? [])].flatMap((group) => group.items ?? []);
	const countriesGroup = findGroup(storyblokGroups, COUNTRIES_OVERVIEW);
	const programsDropdown = menu.find(
		(item) => isDropdownItem(item) && Boolean(findGroup(item.menuItemGroups, PROGRAMS_OVERVIEW)),
	);
	const aboutLabel = menu.find((item) => isDropdownItem(item) && item !== programsDropdown)?.label;
	const journal = toSiteMenuEntries(menu, lang, currency).filter((entry) => entry.type === 'link');

	const whoWeSupport: SiteMenuEntry = {
		type: 'dropdown',
		id: 'who-we-support',
		label: t('site-menu.who-we-support'),
		groups: [
			listGroup(
				PROGRAMS_OVERVIEW,
				withCount(programsCount, (count) => t('site-menu.programs-count', { count })),
				programsCount,
				t('site-menu.programs'),
			),
			listGroup(
				FOCUSES_OVERVIEW,
				withCount(focusesCount, (count) => t('site-menu.focuses-count', { count })),
				focusesCount,
			),
			listGroup(
				LOCAL_PARTNERS_OVERVIEW,
				withCount(localPartnersCount, (count) => t('site-menu.partners-count', { count })),
				localPartnersCount,
			),
		].filter((group): group is SiteMenuGroup => Boolean(group?.links.length)),
		footer: countriesGroup && {
			label: recipientsCount
				? t('site-menu.recipients-in', { count: formatCount(recipientsCount) })
				: (countriesGroup.label ?? ''),
			countries: (countriesGroup.items ?? []).flatMap((country) => {
				const code = COUNTRY_CODES_BY_SLUG[toSlug(country.link)];
				const recipients = code ? recipientsByCountry[code]?.recipientsCount : undefined;

				return code && country.label
					? [
							{
								id: country._uid,
								country: code,
								label: recipients === undefined ? country.label : `${country.label} (${formatCount(recipients)})`,
								href: resolveStoryblokLink(country.link, lang, currency),
							},
						]
					: [];
			}),
			overview:
				countriesGroup.overviewLink && countriesGroup.overviewLabel
					? {
							label: countriesGroup.overviewLabel,
							href: resolveStoryblokLink(countriesGroup.overviewLink, lang, currency),
						}
					: undefined,
		},
	};

	const getInvolved: SiteMenuEntry = {
		type: 'dropdown',
		id: 'get-involved',
		label: t('site-menu.get-involved'),
		groups: [
			{
				id: 'get-involved-individual',
				label: t('site-menu.individual'),
				subtitle: withCount(donorsCount, (count) => t('site-menu.donors-count', { count })),
				illustrationSrc: GET_INVOLVED_ILLUSTRATIONS.individual,
				links: [
					// Opens the donation dialog on desktop; the home page with its donation form is the fallback
					link(DONATE_LINK_IDS[0], t('site-menu.items.donate'), ''),
					link('get-involved-individual-fundraise', t('site-menu.items.fundraise'), 'fundraise'),
					link('get-involved-individual-start-program', t('site-menu.items.start-program'), 'start-program?for=individual'),
					link('get-involved-individual-volunteer', t('site-menu.items.volunteer'), 'open-source'),
					link('get-involved-individual-campaigns', t('site-menu.items.campaigns'), 'campaigns'),
				],
			},
			{
				id: 'get-involved-company',
				label: t('site-menu.company'),
				illustrationSrc: GET_INVOLVED_ILLUSTRATIONS.company,
				links: [
					link(DONATE_LINK_IDS[1], t('site-menu.items.company-donate'), ''),
					link('get-involved-company-fundraise', t('site-menu.items.company-fundraise'), 'fundraise'),
					link('get-involved-company-start-program', t('site-menu.items.start-program'), 'start-program?for=company'),
					link('get-involved-company-presentation', t('site-menu.items.presentation'), 'contact'),
				],
			},
			{
				id: 'get-involved-ngo',
				label: t('site-menu.ngo'),
				// The NGOs we work with are our local partners
				subtitle: withCount(localPartnersCount, (count) => t('site-menu.ngos-count', { count })),
				illustrationSrc: GET_INVOLVED_ILLUSTRATIONS.ngo,
				links: [
					link('get-involved-ngo-start-program', t('site-menu.items.start-program'), 'start-program?for=ngo'),
					link('get-involved-ngo-local-partner', t('site-menu.items.local-partner'), 'local-partners'),
				],
			},
		],
		footer: { label: t('site-menu.all-ways'), href: href('get-involved') },
	};

	const about: SiteMenuEntry = {
		type: 'dropdown',
		id: 'about',
		label: aboutLabel ?? '',
		groups: [
			{
				id: 'about-organisation',
				label: 'Social Income',
				subtitle: withCount(volunteersCount, (count) => t('site-menu.volunteers-count', { count })),
				links: [
					...toLinks(pickItems(storyblokItems, ORGANISATION_SLUGS)),
					link('about-contact', t('site-menu.contact'), 'contact'),
				],
			},
			{
				id: 'about-how-we-work',
				label: t('site-menu.how-we-work'),
				subtitle: withCount(recipientsCount, (count) => t('site-menu.recipients-count', { count })),
				links: [
					...toLinks(pickItems(storyblokItems, [RECIPIENT_SELECTION_SLUG])),
					link('about-do-no-harm', t('site-menu.do-no-harm'), 'do-no-harm'),
					link('about-mobile-money', t('site-menu.mobile-money'), 'mobile-money'),
					link('about-recipient-app', t('site-menu.recipient-app'), 'mobile-app'),
					...toLinks(pickItems(storyblokItems, [POLICIES_SLUG])),
				],
			},
			{
				id: 'about-transparency',
				label: t('site-menu.transparency-impact'),
				subtitle:
					paidOutAmount &&
					t('site-menu.paid-out', {
						amount: formatCurrencyLocale(paidOutAmount.amount, paidOutAmount.currency, locale, {
							compactThreshold: 1_000_000,
							compactLocale: locale,
						}),
					}),
				links: toLinks(pickItems(storyblokItems, TRANSPARENCY_SLUGS)),
			},
		].filter((group) => group.links.length > 0),
		footer: {
			label: t('site-menu.newsletter-teaser'),
			overview: { label: t('site-menu.newsletter-cta'), href: href('newsletter') },
			overviewInline: true,
		},
	};

	return [whoWeSupport, getInvolved, ...(aboutLabel ? [about] : []), ...journal];
};
