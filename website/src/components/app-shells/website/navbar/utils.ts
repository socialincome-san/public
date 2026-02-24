import type { DropdownItem, Layout, MenuItem } from '@/generated/storyblok/types/109655/storyblok-components';
import type { Session } from '@/lib/firebase/current-account';

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

export type NavbarMenuItem = Layout['menu'][number];

export const isMenuItem = (item: NavbarMenuItem): item is MenuItem => item.component === 'menuItem';

export const isDropdownItem = (item: NavbarMenuItem): item is DropdownItem => item.component === 'dropdownItem';

export const hasDropdownChildren = (item: DropdownItem): boolean =>
	item.menuItemGroups.some((group) => (group.items?.length ?? 0) > 0);
