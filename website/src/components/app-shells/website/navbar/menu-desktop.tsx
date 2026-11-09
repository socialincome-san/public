'use client';

import { DONATE_LINK_ID } from '@/components/app-shells/website/navbar/utils';
import { useDonationModal } from '@/components/donation-wizard/hooks/use-donation-modal';
import { type SiteMenuEntry } from '@socialincome/design-system/navigation/site-header/site-header';
import { SiteMenuDesktop } from '@socialincome/design-system/navigation/site-header/site-menu-desktop';

export const MenuDesktop = ({ entries }: { entries: SiteMenuEntry[] }) => {
	const { openWizardAtAmountStep } = useDonationModal();

	return (
		<SiteMenuDesktop
			entries={entries.map((entry) =>
				entry.type === 'dropdown'
					? {
							...entry,
							groups: entry.groups.map((group) => ({
								...group,
								links: group.links.map((link) =>
									link.id === DONATE_LINK_ID ? { ...link, onSelect: openWizardAtAmountStep } : link,
								),
							})),
						}
					: entry,
			)}
		/>
	);
};
