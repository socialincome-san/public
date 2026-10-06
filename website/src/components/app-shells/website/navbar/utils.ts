import type { DropdownItem, Layout, MenuItem } from '@/generated/storyblok/types/109655/storyblok-components';
import { resolveStoryblokLink } from '@/lib/storyblok/storyblok-utils';
import type { Session } from '@/modules/auth/auth.types';
import { type SiteMenuEntry } from '@socialincome/design-system/navigation/site-header/site-header';

export type Scope = 'website' | 'dashboard' | 'partner-space';

export const displaySession = (sessions: Session[], scope: Scope): Session | null => {
	if (scope === 'dashboard') {
		return sessions.find((s) => s.type === 'contributor') ?? null;
	}
	if (scope === 'partner-space') {
		return sessions.find((s) => s.type === 'local-partner') ?? null;
	}

	return sessions[0] ?? null;
};

type NavbarMenuItem = Layout['menu'][number];

const isMenuItem = (item: NavbarMenuItem): item is MenuItem => item.component === 'menuItem';

const hasDropdownChildren = (item: DropdownItem): boolean =>
	item.menuItemGroups.some((group) => (group.items?.length ?? 0) > 0 || Boolean(group.overviewLink && group.overviewLabel));

export const toSiteMenuEntries = (menu: Layout['menu'], lang: string, region: string): SiteMenuEntry[] =>
	menu.flatMap((item): SiteMenuEntry[] => {
		if (!item.label) {
			return [];
		}

		if (isMenuItem(item)) {
			return [
				{
					type: 'link',
					id: item._uid,
					label: item.label,
					href: resolveStoryblokLink(item.link, lang, region),
					newTab: item.newTab,
				},
			];
		}

		if (!hasDropdownChildren(item)) {
			return [];
		}

		return [
			{
				type: 'dropdown',
				id: item._uid,
				label: item.label,
				groups: item.menuItemGroups.map((group) => ({
					id: group._uid,
					label: group.label,
					links: (group.items ?? []).map((child) => ({
						id: child._uid,
						label: child.label ?? '',
						href: resolveStoryblokLink(child.link, lang, region),
						newTab: child.newTab,
					})),
					overview:
						group.overviewLink && group.overviewLabel
							? { label: group.overviewLabel, href: resolveStoryblokLink(group.overviewLink, lang, region) }
							: undefined,
				})),
			},
		];
	});
