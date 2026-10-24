'use client';

import { DONATE_LINK_IDS } from '@/components/app-shells/website/navbar/utils';
import { useDonationModal } from '@/components/donation-wizard/hooks/use-donation-modal';
import { type SiteMenuEntry } from '@socialincome/design-system/navigation/site-header/site-header';
import { SiteMenuDesktop } from '@socialincome/design-system/navigation/site-header/site-menu-desktop';

const isDonateLink = (id: string) => DONATE_LINK_IDS.some((donateId) => donateId === id);

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
									isDonateLink(link.id) ? { ...link, onSelect: openWizardAtAmountStep } : link,
								),
							})),
						}
					: entry,
			)}
		/>
	);
};
