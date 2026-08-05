'use client';

import { Badge } from '@/components/badge';
import { Button } from '@/components/button';
import { CountryFlag } from '@/components/country-flag';
import { RadioGroupItem } from '@/components/radio-group';
import type { CountryCode } from '@/generated/prisma/client';
import { cn } from '@/lib/utils/cn';
import { ChevronDown } from 'lucide-react';
import NextImage from 'next/image';

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
	const hasExpandableDetails = Boolean(description || imageUrl || tags.length > 0);
	const detailsContentId = `program-details-${value}`;

	return (
		<div
			data-testid={`program-option-${value}`}
			className={cn(
				'border-border hover:bg-muted/30 border-b px-1 transition-colors last:border-b-0',
				selected && 'bg-muted/20',
				expanded && hasExpandableDetails ? 'flex flex-col gap-6 pt-4 pb-6' : null,
			)}
		>
			<div className={cn('flex items-center gap-3', !(expanded && hasExpandableDetails) && 'py-4')}>
				<label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
					<RadioGroupItem value={value} className="shrink-0" />
					<span className="text-foreground min-w-0 flex-1 truncate text-base font-medium">{name}</span>
					<span className="text-foreground shrink-0 text-sm">{recipientsLabel}</span>
					<span className="flex shrink-0 items-center -space-x-1">
						{countryIsoCodes.map((countryIsoCode) => (
							<span key={countryIsoCode} className="ring-background inline-flex rounded-full ring-2">
								<CountryFlag country={countryIsoCode} size="sm" />
							</span>
						))}
					</span>
				</label>
				{hasExpandableDetails ? (
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="h-9 shrink-0 px-4 pr-3 text-sm"
						aria-expanded={expanded}
						aria-controls={detailsContentId}
						onClick={(event) => {
							event.preventDefault();
							event.stopPropagation();
							onDetailsToggle();
						}}
					>
						{detailsLabel}
						<ChevronDown
							className={cn('size-4 transition-transform duration-200', expanded && 'rotate-180')}
							aria-hidden="true"
						/>
					</Button>
				) : null}
			</div>
			{hasExpandableDetails && expanded ? (
				<div
					id={detailsContentId}
					className="flex flex-col gap-6 pl-7 sm:flex-row sm:items-start"
					data-testid={`program-details-${value}`}
				>
					{imageUrl ? (
						<div className="relative h-[140px] w-full max-w-[248px] shrink-0 overflow-hidden rounded-md">
							<NextImage src={imageUrl} alt={name} fill className="object-cover" sizes="248px" />
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
			) : null}
		</div>
	);
};
