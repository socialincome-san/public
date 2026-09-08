'use client';

import { OpenDonationWizardButton } from '@/components/donation-wizard/triggers/open-donation-wizard-button';
import { OUTFLOW_CHF_100_TOTAL, type OutflowsSectionRow } from '@/components/outflows/outflows-spend';
import { Progress } from '@/components/progress/progress';
import { usePrefersReducedMotion } from '@/lib/hooks/use-prefers-reduced-motion';
import { cn } from '@/lib/utils/cn';
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
	className?: string;
};

export const OutflowsSection = ({ copy, rows, downloadsHref, ngoAverageSourceUrl, className }: Props) => {
	const breakdownListRef = useRef<HTMLUListElement>(null);
	const reduceMotion = usePrefersReducedMotion();
	const barsInView = useInView(breakdownListRef, { once: true, amount: 0.25 });
	const showBars = reduceMotion || barsInView;

	return (
		<section className={cn('grid gap-8 py-6 sm:grid-cols-2 sm:items-start sm:gap-12 md:gap-20 md:py-10', className)}>
			<div className="flex max-w-3xl flex-col gap-6 sm:pt-8">
				<p className="text-sm font-medium text-cyan-900">{copy.eyebrow}</p>
				<h2 className="text-foreground text-4xl leading-tight font-normal md:text-5xl md:leading-[54px]">
					{copy.headlineBeforeBold}
					<span className="font-bold">{copy.headlineBold}</span>
					{copy.headlineAfterBold}
				</h2>
				<div className="mt-2 flex items-center gap-4">
					<Image src="/assets/zewo.svg" alt={copy.zewoAlt} width={48} height={48} className="size-12 shrink-0" />
					<p className="text-muted-foreground max-w-sm text-sm leading-6">
						{copy.zewoBefore}
						<Link href={downloadsHref} className="hover:text-foreground underline underline-offset-2">
							{copy.zewoLink}
						</Link>
						{copy.zewoAfter}
					</p>
				</div>
			</div>

			<div className="flex flex-col gap-4">
				<div className="relative flex w-full flex-col gap-6 rounded-[32px] bg-white px-6 pt-6 pb-8 shadow-[0px_0px_20px_rgba(0,0,0,0.05)] sm:gap-7 sm:px-8 sm:pt-7 sm:pb-10">
					<h3 className="text-2xl leading-none font-medium text-cyan-950">{copy.breakdownTitle}</h3>

					<ul
						ref={breakdownListRef}
						className="flex w-full list-none flex-col gap-6 pl-0 sm:gap-7"
						aria-label={copy.breakdownAriaLabel}
					>
						{rows.map((row) => {
							const widthPercent = (row.chf / OUTFLOW_CHF_100_TOTAL) * 100;

							return (
								<li key={row.id} className="flex w-full flex-col gap-2">
									<div className="flex flex-col gap-1">
										<div className="flex items-baseline justify-between gap-4">
											<span className="min-w-0 text-base leading-6 font-medium text-cyan-950">{row.label}</span>
											<span className="shrink-0 text-base leading-6 font-medium text-cyan-950 tabular-nums">
												CHF {row.chf}
											</span>
										</div>
										<p className="text-muted-foreground text-sm leading-5">{row.description}</p>
									</div>
									<Progress value={showBars ? widthPercent : 0} />
								</li>
							);
						})}
					</ul>

					<div className="flex flex-col gap-5 sm:gap-6">
						<p className="text-foreground w-full text-sm leading-6">
							{copy.ngoAverageBefore}
							<a
								href={ngoAverageSourceUrl}
								className="underline underline-offset-2 hover:text-cyan-900"
								target="_blank"
								rel="noreferrer"
							>
								{copy.ngoAverageSource}
							</a>
							{copy.ngoAverageAfter}
						</p>

						<OpenDonationWizardButton label={copy.donateNow} className="w-full" />
					</div>
				</div>

				<p className="text-muted-foreground text-center text-sm leading-6">
					{copy.annualStatementBefore}
					<Link href={downloadsHref} className="hover:text-foreground underline underline-offset-2">
						{copy.annualStatementLink}
					</Link>
				</p>
			</div>
		</section>
	);
};
