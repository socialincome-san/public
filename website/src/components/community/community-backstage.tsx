'use client';

import { TickerPill } from '@socialincome/design-system/actions/ticker-pill/ticker-pill';
import type { AvatarStackPerson } from '@socialincome/design-system/data-display/avatar-stack/avatar-stack';
import { Backstage } from '@socialincome/design-system/overlays/backstage/backstage';
import { usePathname } from 'next/navigation';
import { createContext, use, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type CommunityBackstageContextValue = {
	open: boolean;
	setOpen: (open: boolean) => void;
	panelHost: HTMLDivElement | null;
};

const CommunityBackstageContext = createContext<CommunityBackstageContextValue | null>(null);

type CommunityBackstageProviderProps = {
	panelLabel: string;
	closeLabel: string;
	children: ReactNode;
};

export const CommunityBackstageProvider = ({ panelLabel, closeLabel, children }: CommunityBackstageProviderProps) => {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);
	const [openPathname, setOpenPathname] = useState(pathname);
	const [panelHost, setPanelHost] = useState<HTMLDivElement | null>(null);

	// Closes the backstage on navigation, e.g. via a link inside the panel
	if (pathname !== openPathname) {
		setOpenPathname(pathname);
		setOpen(false);
	}

	return (
		<CommunityBackstageContext value={{ open, setOpen, panelHost }}>
			<Backstage
				open={open}
				onOpenChange={setOpen}
				panelLabel={panelLabel}
				closeLabel={closeLabel}
				// The page portals its panel in here, so the panel stays a sibling of the sliding app shell
				panel={<div ref={setPanelHost} className="contents" />}
			>
				{children}
			</Backstage>
		</CommunityBackstageContext>
	);
};

type CommunityBackstageTriggerProps = {
	items: string[];
	label: string;
	people: AvatarStackPerson[];
	panel: ReactNode;
};

export const CommunityBackstageTrigger = ({ items, label, people, panel }: CommunityBackstageTriggerProps) => {
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
				onClick={() => context.setOpen(true)}
				expanded={context.open}
			/>
			{context.panelHost ? createPortal(panel, context.panelHost) : null}
		</>
	);
};
