'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import { useState, type ReactNode } from 'react';
import { TabsContent, TabsList, TabsTrigger } from '../../navigation/tabs/tabs';
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../dialog/dialog';

export type TabbedDialogTab = {
	value: string;
	label: string;
	content: ReactNode;
};

type TabbedDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: ReactNode;
	description?: ReactNode;
	tabs: TabbedDialogTab[];
	defaultTab?: string;
	closeLabel?: string;
};

type TabbedDialogTabsProps = Pick<TabbedDialogProps, 'title' | 'description' | 'tabs'> & { defaultTab: string };

// Rendered inside DialogContent, so the active and visited tabs reset whenever the dialog opens again
const TabbedDialogTabs = ({ title, description, tabs, defaultTab }: TabbedDialogTabsProps) => {
	const [visitedTabs, setVisitedTabs] = useState(() => new Set([defaultTab]));

	return (
		<TabsPrimitive.Root
			defaultValue={defaultTab}
			onValueChange={(value) => setVisitedTabs((previous) => new Set(previous).add(value))}
			className="flex min-h-0 flex-1 flex-col gap-4"
		>
			<DialogHeader>
				<DialogTitle>{title}</DialogTitle>
				{description && <DialogDescription>{description}</DialogDescription>}
				<div className="pt-3">
					<TabsList>
						{tabs.map((tab) => (
							<TabsTrigger key={tab.value} value={tab.value}>
								{tab.label}
							</TabsTrigger>
						))}
					</TabsList>
				</div>
			</DialogHeader>
			<DialogBody>
				{tabs.map(
					(tab) =>
						// A tab mounts on first visit, so its data loads lazily, and then stays mounted to keep unsaved input
						visitedTabs.has(tab.value) && (
							<TabsContent key={tab.value} value={tab.value} forceMount>
								{tab.content}
							</TabsContent>
						),
				)}
			</DialogBody>
		</TabsPrimitive.Root>
	);
};

export const TabbedDialog = ({
	open,
	onOpenChange,
	title,
	description,
	tabs,
	defaultTab,
	closeLabel,
}: TabbedDialogProps) => (
	<Dialog open={open} onOpenChange={onOpenChange}>
		<DialogContent size="lg" height="fixed" closeLabel={closeLabel}>
			<TabbedDialogTabs
				title={title}
				description={description}
				tabs={tabs}
				defaultTab={defaultTab ?? tabs[0]?.value ?? ''}
			/>
		</DialogContent>
	</Dialog>
);
