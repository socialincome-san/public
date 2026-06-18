'use client';

import type {
	ProgramAboutContent,
	ProgramAboutDetailRow,
	ProgramAboutOverlaySection,
} from '@/components/storyblok/program/build-program-about-content';
import { ProgramDetailDialog } from '@/components/storyblok/program/program-detail-dialog';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

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

export const ProgramAboutDialog = ({ aboutTitle, viewDetailsLabel, content }: Props) => (
	<ProgramDetailDialog title={aboutTitle} triggerLabel={viewDetailsLabel}>
		{content.description ? <p className="text-foreground text-base leading-6">{content.description}</p> : null}

		{content.overlaySections.map((section) => (
			<OverlaySection key={section.id} section={section} />
		))}
	</ProgramDetailDialog>
);
