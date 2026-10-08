'use client';

import { TickerPill } from '@socialincome/design-system/actions/ticker-pill/ticker-pill';
import type { AvatarStackPerson } from '@socialincome/design-system/data-display/avatar-stack/avatar-stack';
import { Backstage } from '@socialincome/design-system/overlays/backstage/backstage';
import { usePathname } from 'next/navigation';
import { createContext, use, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type BackstageLabels = {
	panelLabel: string;
	closeLabel: string;
};

type CommunityBackstageContextValue = {
	open: boolean;
	show: (labels: BackstageLabels) => void;
	panelHost: HTMLDivElement | null;
};

const CommunityBackstageContext = createContext<CommunityBackstageContextValue | null>(null);

export const CommunityBackstageProvider = ({ children }: { children: ReactNode }) => {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);
	// Set by the trigger, so the layout does not need to load the page's translations
	const [labels, setLabels] = useState<BackstageLabels>({ panelLabel: '', closeLabel: '' });
	const [openPathname, setOpenPathname] = useState(pathname);
	const [panelHost, setPanelHost] = useState<HTMLDivElement | null>(null);

	// Closes the backstage on navigation, e.g. via a link inside the panel
	if (pathname !== openPathname) {
		setOpenPathname(pathname);
		setOpen(false);
	}

	const show = (nextLabels: BackstageLabels) => {
		setLabels(nextLabels);
		setOpen(true);
	};

	return (
		<CommunityBackstageContext value={{ open, show, panelHost }}>
			<Backstage
				open={open}
				onOpenChange={setOpen}
				panelLabel={labels.panelLabel}
				closeLabel={labels.closeLabel}
				// The page portals its panel in here, so the panel stays a sibling of the sliding app shell
				panel={<div ref={setPanelHost} className="contents" />}
			>
				{children}
			</Backstage>
		</CommunityBackstageContext>
	);
};

type CommunityBackstageTriggerProps = BackstageLabels & {
	items: string[];
	label: string;
	people: AvatarStackPerson[];
	panel: ReactNode;
};

export const CommunityBackstageTrigger = ({
	items,
	label,
	people,
	panel,
	panelLabel,
	closeLabel,
}: CommunityBackstageTriggerProps) => {
	const context = use(CommunityBackstageContext);
	if (!context) {
		return null;
	}

	return (
		<>
			<TickerPill
				items={items}
				label={label}
				people={people}
				onClick={() => context.show({ panelLabel, closeLabel })}
				expanded={context.open}
			/>
			{context.panelHost ? createPortal(panel, context.panelHost) : null}
		</>
	);
};
