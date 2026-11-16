import { getCountryRecipients, getPaidOutFigure } from '@/components/public-figures/public-figures';
import type {
	DropdownItem,
	Layout,
	MenuFooter,
	MenuItem,
	MenuItemGroup,
} from '@/generated/storyblok/types/109655/storyblok-components';
import { getSafeNumberFormatLocale, type WebsiteCurrency, type WebsiteLanguage } from '@/lib/i18n/utils';
import { type Result } from '@/lib/result';
import { resolveStoryblokLink } from '@/lib/storyblok/storyblok-utils';
import { formatNumberLocale } from '@/lib/utils/string-utils';
import { getContributorCommunityStatsAction } from '@/modules/contributors/contributor.actions';
import {
	getAllPersonsAction,
	getFocusesAction,
	getLocalPartnersAction,
	getProgramsAction,
} from '@/modules/storyblok-content/storyblok-content.actions';
import {
	type SiteMenuEntry,
	type SiteMenuFooter,
	type SiteMenuGroup,
	type SiteMenuLink,
} from '@socialincome/design-system/navigation/site-header/site-header';

type Stat = NonNullable<MenuItemGroup['stat']>;

type Figures = {
	stats: Partial<Record<Stat, string>>;
	// Keyed by the uuid of the country story, which menu links point to
	countries: Map<string, { isoCode: string; recipients?: string }>;
};

const countOf = (result: Result<unknown[]>) => (result.success ? result.data.length : 0);

const getFigures = async (lang: WebsiteLanguage, currency: WebsiteCurrency): Promise<Figures> => {
	const [programs, focuses, localPartners, persons, communityStats, countryRecipients, paidOut] = await Promise.all([
		getProgramsAction(lang),
		getFocusesAction(lang),
		getLocalPartnersAction(lang),
		getAllPersonsAction(lang),
		getContributorCommunityStatsAction(),
		getCountryRecipients(lang),
		getPaidOutFigure(lang, currency),
	]);

	const locale = getSafeNumberFormatLocale(lang);
	const format = (value: number) => formatNumberLocale(value, locale);
	const count = (value: number) => (value > 0 ? format(value) : undefined);

	return {
		stats: {
			programs: count(countOf(programs)),
			focuses: count(countOf(focuses)),
			localPartners: count(countOf(localPartners)),
			volunteers: count(countOf(persons)),
			donors: count(communityStats.success ? communityStats.data.supporterCount : 0),
			recipients: count(countryRecipients.reduce((total, country) => total + (country.recipients ?? 0), 0)),
			paidOut,
		},
		countries: new Map(
			countryRecipients.map((country) => [
				country.uuid,
				{
					isoCode: country.isoCode,
					recipients: country.recipients === undefined ? undefined : format(country.recipients),
				},
			]),
		),
	};
};

// Texts may contain {value}; without a figure for it, the text is left out
const fillValue = (text: string | undefined, value: string | undefined) => {
	if (!text) {
		return undefined;
	}

	return text.includes('{value}') ? value && text.replaceAll('{value}', value) : text;
};

/** The header menu, edited in Storyblok as the layout's `mainMenu`. */
export const getSiteMenuEntries = async (
	layout: Layout | undefined,
	lang: WebsiteLanguage,
	currency: WebsiteCurrency,
): Promise<SiteMenuEntry[]> => {
	const figures = await getFigures(lang, currency);

	const toLink = (item: MenuItem): SiteMenuLink => ({
		id: item._uid,
		label: item.label ?? '',
		href: resolveStoryblokLink(item.link, lang, currency),
		newTab: item.newTab,
	});

	const toOverview = (label: string | undefined, link: MenuItem['link'], value: string | undefined) => {
		const filledLabel = fillValue(label, value);
		// Unset links resolve to '#'
		const href = resolveStoryblokLink(link, lang, currency);

		return filledLabel && href !== '#' ? { label: filledLabel, href } : undefined;
	};

	const toGroup = (group: MenuItemGroup): SiteMenuGroup => {
		const value = group.stat ? figures.stats[group.stat] : undefined;

		return {
			id: group._uid,
			label: group.label,
			badge: fillValue(group.badge, value),
			illustrationSrc: group.illustration?.filename ?? undefined,
			links: (group.items ?? []).map(toLink),
			overview: toOverview(group.overviewLabel, group.overviewLink, value),
		};
	};

	// Links to a country page show its flag and number of recipients
	const toFooterLink = (item: MenuItem) => {
		const country = item.link?.id ? figures.countries.get(item.link.id) : undefined;

		if (!country) {
			return toLink(item);
		}
		const label = country.recipients ? `${item.label ?? ''} (${country.recipients})` : (item.label ?? '');

		return { ...toLink(item), label, country: country.isoCode };
	};

	const toFooter = (footer: MenuFooter): SiteMenuFooter => {
		const value = footer.stat ? figures.stats[footer.stat] : undefined;

		return {
			label: fillValue(footer.text, value),
			links: (footer.links ?? []).map(toFooterLink),
			overview: toOverview(footer.overviewLabel, footer.overviewLink, value),
		};
	};

	const toEntry = (item: MenuItem | DropdownItem): SiteMenuEntry[] => {
		if (!item.label) {
			return [];
		}
		if (item.component === 'menuItem') {
			return [{ type: 'link', ...toLink(item) }];
		}
		const groups = item.menuItemGroups.map(toGroup).filter((group) => group.links.length > 0 || group.overview);
		const footer = item.footer?.[0];

		return groups.length > 0
			? [{ type: 'dropdown', id: item._uid, label: item.label, groups, footer: footer && toFooter(footer) }]
			: [];
	};

	return (layout?.mainMenu ?? []).flatMap(toEntry);
};
