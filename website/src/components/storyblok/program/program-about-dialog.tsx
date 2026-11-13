'use client';

import type {
	ProgramAboutContent,
	ProgramAboutDetailRow,
	ProgramAboutOverlaySection,
} from '@/components/storyblok/program/build-program-about-content';
import { ProgramAboutRowValues } from '@/components/storyblok/program/program-about-row-values';
import { ProgramDetailDialog } from '@/components/storyblok/program/program-detail-dialog';
import { TagList } from '@socialincome/design-system/data-display/tag-list/tag-list';
import { AnimatedCircleIcon } from '@socialincome/design-system/icons/animated-circle-icon/animated-circle-icon';
import { type ReactNode } from 'react';

type Props = {
	aboutTitle: string;
	viewDetailsLabel: string;
	closeAriaLabel: string;
	content: ProgramAboutContent;
	wallet: ReactNode;
};

const OverlayDetailRows = ({ rows }: { rows: ProgramAboutDetailRow[] }) => (
	<dl className="flex flex-col gap-2 pt-2 text-base">
		{rows.map((row) => (
			<div key={row.label} className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,250px)_1fr] sm:gap-10">
				<dt className="font-medium">{row.label}</dt>
				<dd>
					<ProgramAboutRowValues values={row.values} layout="stacked" />
				</dd>
			</div>
		))}
	</dl>
);

const OverlaySection = ({ section }: { section: ProgramAboutOverlaySection }) => (
	<div className="last:pb-8">
		<div className="border-border flex items-center justify-between gap-4 border-b pt-8 pb-2 first:pt-6">
			<h3 className="text-xl font-medium">{section.title}</h3>
			{section.responsibleCircle ? (
				<TagList
					size="xl"
					items={[
						{
							...section.responsibleCircle,
							icon: <AnimatedCircleIcon size={22} />,
							variant: 'light',
						},
					]}
				/>
			) : null}
		</div>
		<OverlayDetailRows rows={section.rows} />
	</div>
);

export const ProgramAboutDialog = ({ aboutTitle, viewDetailsLabel, closeAriaLabel, content, wallet }: Props) => (
	<ProgramDetailDialog title={aboutTitle} triggerLabel={viewDetailsLabel} closeAriaLabel={closeAriaLabel}>
		{/* Same columns as the detail rows below; the top padding leaves room for the wallet images rising on hover */}
		<div className="grid grid-cols-1 items-start gap-6 pt-8 sm:grid-cols-[minmax(0,250px)_1fr] sm:gap-10">
			<div className="w-48">{wallet}</div>
			{content.description ? <p className="text-foreground text-xl leading-8">{content.description}</p> : null}
		</div>

		{content.overlaySections.map((section) => (
			<OverlaySection key={section.id} section={section} />
		))}
	</ProgramDetailDialog>
);
