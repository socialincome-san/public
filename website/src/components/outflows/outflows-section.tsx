'use client';

import { OpenDonationWizardButton } from '@/components/donation-wizard/triggers/open-donation-wizard-button';
import { type OutflowsSectionRow } from '@/components/outflows/outflows-spend';
import { usePrefersReducedMotion } from '@/lib/hooks/use-prefers-reduced-motion';
import { BreakdownList, BreakdownRow } from '@socialincome/design-system/data-display/breakdown-list/breakdown-list';
import { Progress } from '@socialincome/design-system/feedback/progress/progress';
import { SplitSection, SplitSectionCard } from '@socialincome/design-system/layout/split-section/split-section';
import { useInView } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';

type OutflowsSectionCopy = {
	eyebrow: string;
	headlineBeforeBold: string;
	headlineBold: string;
	headlineAfterBold: string;
	zewoBefore: string;
	zewoLink: string;
	zewoAfter: string;
	zewoAlt: string;
	breakdownTitle: string;
	breakdownAriaLabel: string;
	ngoAverageBefore: string;
	ngoAverageSource: string;
	ngoAverageAfter: string;
	donateNow: string;
	annualStatementBefore: string;
	annualStatementLink: string;
};

type Props = {
	copy: OutflowsSectionCopy;
	rows: OutflowsSectionRow[];
	downloadsHref: string;
	ngoAverageSourceUrl: string;
};

export const OutflowsSection = ({ copy, rows, downloadsHref, ngoAverageSourceUrl }: Props) => {
	const breakdownListRef = useRef<HTMLUListElement>(null);
	const reduceMotion = usePrefersReducedMotion();
	const barsInView = useInView(breakdownListRef, { once: true, amount: 0.25 });
	const showBars = reduceMotion || barsInView;

	return (
		<SplitSection
			eyebrow={copy.eyebrow}
			headline={
				<>
					{copy.headlineBeforeBold}
					<strong>{copy.headlineBold}</strong>
					{copy.headlineAfterBold}
				</>
			}
			intro={
				<div className="flex items-center gap-4">
					<Image src="/assets/zewo.svg" alt={copy.zewoAlt} width={48} height={48} className="size-12 shrink-0" />
					<p className="text-muted-foreground max-w-sm text-sm leading-6">
						{copy.zewoBefore}
						<Link href={downloadsHref} className="hover:text-foreground underline underline-offset-2">
							{copy.zewoLink}
						</Link>
						{copy.zewoAfter}
					</p>
				</div>
			}
		>
			<SplitSectionCard title={copy.breakdownTitle}>
				<BreakdownList ref={breakdownListRef} ariaLabel={copy.breakdownAriaLabel}>
					{rows.map((row) => (
						<BreakdownRow key={row.id} label={row.label} value={`CHF ${row.chf}`} description={row.description}>
							{/* Rows split a CHF 100 donation, so the amount is already the share in percent. */}
							<Progress value={showBars ? row.chf : 0} />
						</BreakdownRow>
					))}
				</BreakdownList>

				<div className="flex flex-col gap-5 sm:gap-6">
					<p className="text-foreground w-full text-sm leading-6">
						{copy.ngoAverageBefore}
						<a
							href={ngoAverageSourceUrl}
							className="hover:text-foreground underline underline-offset-2"
							target="_blank"
							rel="noreferrer"
						>
							{copy.ngoAverageSource}
						</a>
						{copy.ngoAverageAfter}
					</p>

					<OpenDonationWizardButton label={copy.donateNow} fullWidth />
				</div>
			</SplitSectionCard>

			<p className="text-muted-foreground text-center text-sm leading-6">
				{copy.annualStatementBefore}
				<Link href={downloadsHref} className="hover:text-foreground underline underline-offset-2">
					{copy.annualStatementLink}
				</Link>
			</p>
		</SplitSection>
	);
};
