'use client';

import { Badge } from '@/components/badge/badge';
import { Button } from '@/components/button/button';
import { CountryFlag } from '@/components/country-flag/country-flag';
import { RadioGroupItem } from '@/components/radio-group';
import type { CountryCode } from '@/generated/prisma/client';
import { cn } from '@/lib/utils/cn';
import * as RadixAccordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import NextImage from 'next/image';
import { useEffect, useRef } from 'react';

const ACCORDION_ANIMATION_MS = 200;

const getScrollParent = (element: HTMLElement): HTMLElement | null => {
	let parent = element.parentElement;

	while (parent) {
		const { overflowY } = getComputedStyle(parent);
		if (overflowY === 'auto' || overflowY === 'scroll') {
			return parent;
		}

		parent = parent.parentElement;
	}

	return null;
};

type Props = {
	value: string;
	name: string;
	selected: boolean;
	recipientsLabel: string;
	detailsLabel: string;
	countryIsoCodes: readonly CountryCode[];
	expanded: boolean;
	onDetailsToggle: () => void;
	description?: string | null;
	imageUrl?: string | null;
	tags?: readonly string[];
};

export const ProgramOptionRow = ({
	value,
	name,
	selected,
	recipientsLabel,
	detailsLabel,
	countryIsoCodes,
	expanded,
	onDetailsToggle,
	description = null,
	imageUrl = null,
	tags = [],
}: Props) => {
	const rowRef = useRef<HTMLDivElement>(null);
	const hasExpandableDetails = Boolean(description) || Boolean(imageUrl) || tags.length > 0;
	const detailsContentId = `program-details-${value}`;

	useEffect(() => {
		if (!expanded || !hasExpandableDetails) {
			return;
		}

		const row = rowRef.current;
		if (!row) {
			return;
		}

		// Wait for the accordion open animation so the full height is included.
		const timeoutId = setTimeout(() => {
			const scrollParent = getScrollParent(row);
			if (!scrollParent) {
				row.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });

				return;
			}

			const rowRect = row.getBoundingClientRect();
			const parentRect = scrollParent.getBoundingClientRect();
			const overflowBottom = rowRect.bottom - parentRect.bottom;
			const overflowTop = parentRect.top - rowRect.top;

			if (overflowBottom > 0) {
				scrollParent.scrollBy({ top: overflowBottom + 12, behavior: 'smooth' });
			} else if (overflowTop > 0) {
				scrollParent.scrollBy({ top: -overflowTop - 12, behavior: 'smooth' });
			}
		}, ACCORDION_ANIMATION_MS);

		return () => clearTimeout(timeoutId);
	}, [expanded, hasExpandableDetails]);

	const programLabel = (
		<label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
			<RadioGroupItem value={value} className="shrink-0" />
			<span className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
				<span className="text-foreground min-w-0 truncate text-base font-medium sm:flex-1">{name}</span>
				<span className="flex shrink-0 items-center gap-2">
					<span className="text-foreground text-sm">{recipientsLabel}</span>
					<span className="flex items-center -space-x-1">
						{countryIsoCodes.map((countryIsoCode) => (
							<span key={countryIsoCode} className="ring-background inline-flex rounded-full ring-2">
								<CountryFlag country={countryIsoCode} size="sm" />
							</span>
						))}
					</span>
				</span>
			</span>
		</label>
	);

	return (
		<div
			ref={rowRef}
			data-testid={`program-option-${value}`}
			className={cn(
				'border-border hover:bg-muted/30 min-w-0 border-b px-6 transition-colors last:border-b-0',
				selected && 'bg-muted/20',
			)}
		>
			{hasExpandableDetails ? (
				<RadixAccordion.Root
					type="single"
					collapsible
					value={expanded ? value : ''}
					onValueChange={(nextValue) => {
						const shouldBeExpanded = nextValue === value;
						if (shouldBeExpanded !== expanded) {
							onDetailsToggle();
						}
					}}
					className="min-w-0"
				>
					<RadixAccordion.Item value={value} className="min-w-0">
						<div className="flex min-w-0 items-center gap-3 py-4">
							{programLabel}
							<RadixAccordion.Header asChild>
								<div className="flex shrink-0">
									<RadixAccordion.Trigger asChild>
										<Button
											type="button"
											variant="outline"
											size="sm"
											className="h-9 shrink-0 px-4 pr-3 text-sm"
											aria-controls={detailsContentId}
											onClick={(event) => {
												event.stopPropagation();
											}}
										>
											{detailsLabel}
											<ChevronDown
												className={cn('size-4 transition-transform duration-200', expanded && 'rotate-180')}
												aria-hidden="true"
											/>
										</Button>
									</RadixAccordion.Trigger>
								</div>
							</RadixAccordion.Header>
						</div>
						<RadixAccordion.Content
							id={detailsContentId}
							className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden"
							data-testid={`program-details-${value}`}
						>
							<div className="flex flex-col gap-6 pb-6 sm:flex-row sm:items-start sm:pl-7">
								{imageUrl ? (
									<div className="relative h-[160px] w-full overflow-hidden rounded-md sm:h-[140px] sm:max-w-[248px] sm:shrink-0">
										<NextImage
											src={imageUrl}
											alt={name}
											fill
											className="object-cover"
											sizes="(max-width: 639px) 100vw, 248px"
										/>
									</div>
								) : null}
								<div className="flex min-w-0 flex-1 flex-col gap-4">
									{description ? <p className="text-foreground text-sm leading-5">{description}</p> : null}
									{tags.length > 0 ? (
										<div className="flex flex-wrap items-center gap-2">
											{tags.map((tag) => (
												<Badge key={tag} variant="default" className="border-transparent px-3 py-1.5 text-xs font-medium">
													{tag}
												</Badge>
											))}
										</div>
									) : null}
								</div>
							</div>
						</RadixAccordion.Content>
					</RadixAccordion.Item>
				</RadixAccordion.Root>
			) : (
				<div className="flex min-w-0 items-center gap-3 py-4">{programLabel}</div>
			)}
		</div>
	);
};
