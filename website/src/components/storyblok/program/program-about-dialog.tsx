'use client';

import { Button } from '@/components/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import type {
	ProgramAboutContent,
	ProgramAboutDetailRow,
	ProgramAboutOverlaySection,
} from '@/components/storyblok/program/build-program-about-content';
import { ProgramDetailPill } from '@/components/storyblok/program/program-detail-pill';
import { ExternalLink, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

type Props = {
	aboutTitle: string;
	viewDetailsLabel: string;
	content: ProgramAboutContent;
};

const OverlayDetailValue = ({ row }: { row: ProgramAboutDetailRow }) => {
	if (row.href) {
		return (
			<span className="inline-flex items-center gap-1">
				<Link href={row.href} className="hover:underline">
					{row.value}
				</Link>
				<ExternalLink className="size-4 shrink-0" aria-hidden="true" />
			</span>
		);
	}

	return <span>{row.value}</span>;
};

const OverlayDetailRows = ({ rows }: { rows: ProgramAboutDetailRow[] }) => (
	<dl className="flex flex-col gap-2 pt-2 text-base">
		{rows.map((row) => (
			<div key={row.label} className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,250px)_1fr] sm:gap-10">
				<dt className="font-bold">{row.label}</dt>
				<dd>
					<OverlayDetailValue row={row} />
				</dd>
			</div>
		))}
	</dl>
);

const OverlaySection = ({ section }: { section: ProgramAboutOverlaySection }) => (
	<div>
		<div className="border-border border-b pt-8 pb-2 first:pt-6">
			<h3 className="font-bold">{section.title}</h3>
		</div>
		<OverlayDetailRows rows={section.rows} />
	</div>
);

export const ProgramAboutDialog = ({ aboutTitle, viewDetailsLabel, content }: Props) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<ProgramDetailPill label={viewDetailsLabel} isOpen={isOpen} onClick={() => setIsOpen(true)} />

			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent
					hideCloseButton
					className="flex max-h-[85vh] flex-col gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-2xl"
				>
					<DialogHeader className="border-border bg-background sticky top-0 z-10 mx-0 flex shrink-0 flex-row items-center justify-between gap-4 space-y-0 rounded-t-3xl border-b px-12 py-6">
						<DialogTitle className="text-2xl leading-none font-medium">{aboutTitle}</DialogTitle>
						<Button
							type="button"
							size="icon"
							variant="ghost"
							className="size-8 rounded-full"
							onClick={() => setIsOpen(false)}
							aria-label="Close"
						>
							<X aria-hidden="true" />
						</Button>
					</DialogHeader>

					<div className="overflow-y-auto px-12 pt-8 pb-12">
						{content.description ? <p className="text-foreground text-base leading-6">{content.description}</p> : null}

						{content.overlaySections.map((section) => (
							<OverlaySection key={section.id} section={section} />
						))}
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};
