'use client';

import { CountryFlag } from '@/components/country-flag';
import { Dialog, DialogContent, DialogTitle } from '@/components/dialog';
import { type CountryCode } from '@/generated/prisma/enums';
import { splitTranslationTemplate } from '@/lib/services/transparency/countries-distribution';
import { OTHER_COUNTRY_SEGMENT_CODE } from '@/lib/services/transparency/transparency.types';
import { cn } from '@/lib/utils/cn';
import { Fragment, useRef, useState, type CSSProperties, type ReactNode } from 'react';

export type CountriesSectionSegment = {
	id: string;
	countryCode: CountryCode | null;
	countryName: string;
	formattedAmount: string;
	formattedPercentage: string;
	unitCount: number;
	color: string;
	rowAriaLabel: string;
};

export type CountriesSectionOtherCountry = {
	countryCode: CountryCode;
	countryName: string;
	formattedAmount: string;
};

export type CountriesSectionClientProps = {
	sectionTitle: string;
	headlineTemplate: string;
	headlineCountryTemplate: string;
	headlineOtherTemplate: string;
	otherCountriesLabel: string;
	emptyLabel: string;
	chartAriaLabel: string;
	dialogTitle: string;
	formattedTotalAmount: string;
	formattedCountriesCount: string;
	segments: CountriesSectionSegment[];
	otherCountries: CountriesSectionOtherCountry[];
};

const interpolateHeadline = (template: string, values: Record<string, ReactNode>): ReactNode => {
	return splitTranslationTemplate(template).map((part, index) => {
		if (part.type === 'text') {
			return <Fragment key={index}>{part.value}</Fragment>;
		}

		return <Fragment key={index}>{values[part.key]}</Fragment>;
	});
};

const EmphasizedValue = ({ children }: { children: ReactNode }) => {
	return <strong className="font-medium tabular-nums">{children}</strong>;
};

export const CountriesSectionClient = ({
	sectionTitle,
	headlineTemplate,
	headlineCountryTemplate,
	headlineOtherTemplate,
	otherCountriesLabel,
	emptyLabel,
	chartAriaLabel,
	dialogTitle,
	formattedTotalAmount,
	formattedCountriesCount,
	segments,
	otherCountries,
}: CountriesSectionClientProps) => {
	const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
	const [isOtherDialogOpen, setIsOtherDialogOpen] = useState(false);
	const interactionRef = useRef<HTMLDivElement>(null);
	const resolvedActiveSegmentId = segments.some((segment) => segment.id === activeSegmentId) ? activeSegmentId : null;
	const activeSegment = segments.find((segment) => segment.id === resolvedActiveSegmentId);
	const hasOtherCountries = otherCountries.length > 0;
	const unitBars = segments.flatMap((segment) =>
		Array.from({ length: segment.unitCount }, (_, index) => ({
			key: `${segment.id}-${index}`,
			segmentId: segment.id,
			color: segment.color,
		})),
	);

	const isOtherActive = activeSegment?.id === OTHER_COUNTRY_SEGMENT_CODE;
	const headlineValues =
		activeSegment === undefined
			? {
					amount: <EmphasizedValue>{formattedTotalAmount}</EmphasizedValue>,
					countriesCount: <EmphasizedValue>{formattedCountriesCount}</EmphasizedValue>,
				}
			: {
					amount: <EmphasizedValue>{activeSegment.formattedAmount}</EmphasizedValue>,
					country: (
						<span className="inline-flex items-center gap-2 align-baseline">
							<strong className="leading-none font-medium">{activeSegment.countryName}</strong>
							{activeSegment.countryCode ? (
								<CountryFlag
									country={activeSegment.countryCode}
									size="lg"
									decorative
									className="size-[1em] shrink-0 text-[length:inherit]"
								/>
							) : null}
						</span>
					),
				};
	const activeHeadlineTemplate = isOtherActive
		? headlineOtherTemplate
		: activeSegment === undefined
			? headlineTemplate
			: headlineCountryTemplate;
	const headline = interpolateHeadline(activeHeadlineTemplate, headlineValues);

	const setActiveFromEvent = (segmentId: string) => {
		setActiveSegmentId(segmentId);
	};

	const isInsideInteraction = (target: EventTarget | null): boolean => {
		return target instanceof Node && Boolean(interactionRef.current?.contains(target));
	};

	const clearActiveIfLeavingInteraction = (relatedTarget: EventTarget | null) => {
		if (isInsideInteraction(relatedTarget) || isOtherDialogOpen) {
			return;
		}

		setActiveSegmentId(null);
	};

	return (
		<div className="flex flex-col gap-8">
			<div className="flex flex-col gap-2">
				<p className="text-sm font-medium">{sectionTitle}</p>
				<h2 className="text-4xl leading-snug font-light md:text-5xl">{headline}</h2>
			</div>
			{segments.length === 0 ? (
				<p className="text-muted-foreground">{emptyLabel}</p>
			) : (
				<div
					ref={interactionRef}
					className="flex flex-col gap-8"
					onMouseLeave={(event) => clearActiveIfLeavingInteraction(event.relatedTarget)}
				>
					<div
						role="img"
						aria-label={chartAriaLabel}
						className="flex h-[54px] w-full items-stretch justify-between sm:h-[62px]"
					>
						{unitBars.map((bar) => {
							const isDimmed = resolvedActiveSegmentId !== null && bar.segmentId !== resolvedActiveSegmentId;

							return (
								<span
									key={bar.key}
									aria-hidden="true"
									className={cn(
										'h-full w-0.5 rounded-full sm:w-[3px]',
										'transition-opacity duration-150 motion-reduce:transition-none',
										isDimmed && 'opacity-25',
									)}
									style={{ backgroundColor: bar.color }}
								/>
							);
						})}
					</div>
					<ul
						className="grid grid-cols-1 gap-1 sm:grid-flow-col sm:grid-cols-2 sm:grid-rows-[repeat(var(--legend-rows),auto)] sm:gap-x-8"
						style={{ '--legend-rows': Math.max(1, Math.ceil(segments.length / 2)) } as CSSProperties}
					>
						{segments.map((segment) => {
							const isActive = resolvedActiveSegmentId === segment.id;
							const isOther = segment.id === OTHER_COUNTRY_SEGMENT_CODE;
							const rowClassName = cn(
								'flex w-full min-w-0 items-center gap-3 rounded-lg px-2 py-2 text-left',
								'transition-colors duration-150 motion-reduce:transition-none',
								'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
								isActive && 'bg-muted/50',
							);

							const rowContent = (
								<>
									{segment.countryCode ? (
										<CountryFlag country={segment.countryCode} size="sm" decorative />
									) : (
										<span className="bg-muted size-4 shrink-0 rounded-full" aria-hidden="true" />
									)}
									<span className="min-w-0 flex-1 truncate">{segment.countryName || otherCountriesLabel}</span>
									<span className="text-muted-foreground shrink-0 tabular-nums">{segment.formattedAmount}</span>
									<span className="w-12 shrink-0 text-right font-semibold tabular-nums">{segment.formattedPercentage}</span>
								</>
							);

							return (
								<li key={segment.id}>
									<button
										type="button"
										className={rowClassName}
										aria-label={segment.rowAriaLabel}
										onMouseEnter={() => setActiveFromEvent(segment.id)}
										onFocus={() => setActiveFromEvent(segment.id)}
										onBlur={(event) => clearActiveIfLeavingInteraction(event.relatedTarget)}
										onClick={isOther && hasOtherCountries ? () => setIsOtherDialogOpen(true) : undefined}
									>
										{rowContent}
									</button>
								</li>
							);
						})}
					</ul>
				</div>
			)}
			{hasOtherCountries ? (
				<Dialog open={isOtherDialogOpen} onOpenChange={setIsOtherDialogOpen}>
					<DialogContent className="flex max-h-[min(85vh,40rem)] flex-col overflow-hidden rounded-3xl sm:max-w-md">
						<DialogTitle>{dialogTitle}</DialogTitle>
						<ul className="min-h-0 overflow-y-auto">
							{otherCountries.map((country) => (
								<li key={country.countryCode} className="flex items-center gap-3 py-2">
									<CountryFlag country={country.countryCode} size="sm" decorative />
									<span className="min-w-0 flex-1 truncate">{country.countryName}</span>
									<span className="shrink-0 tabular-nums">{country.formattedAmount}</span>
								</li>
							))}
						</ul>
					</DialogContent>
				</Dialog>
			) : null}
		</div>
	);
};
