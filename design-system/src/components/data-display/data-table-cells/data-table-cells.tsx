'use client';

import { Check, ChevronRightIcon, Clock3Icon, Copy, Download } from 'lucide-react';
import Link from 'next/link';
import { type MouseEvent, type ReactNode } from 'react';
import { useCopyToClipboard } from '../../../use-copy-to-clipboard';
import { Button } from '../../actions/button/button';
import { Progress } from '../../feedback/progress/progress';
import { LongHairIcon, ShortHairIcon } from '../../icons/custom-icons/custom-icons';
import { Badge } from '../badge/badge';

type DataTableTextCellProps = {
	value?: string | null;
	/** Blurs the value, for data the viewer may not read */
	obfuscated?: boolean;
};

export const DataTableTextCell = ({ value, obfuscated = false }: DataTableTextCellProps) => (
	<span className={obfuscated ? 'inline-block px-1 blur-[6px] saturate-150 select-none' : 'inline-block'}>
		{value?.length ? value : '—'}
	</span>
);

type DataTableValueCellProps = {
	value?: ReactNode;
};

/** Renders a muted dash when there is no value */
export const DataTableValueCell = ({ value }: DataTableValueCellProps) =>
	value === null || value === undefined ? <span className="text-muted-foreground">–</span> : <span>{value}</span>;

type DataTableDateCellProps = {
	formattedDate?: string;
};

export const DataTableDateCell = ({ formattedDate }: DataTableDateCellProps) =>
	formattedDate ? <span data-testid="date-cell">{formattedDate}</span> : <span>-</span>;

type DataTableDaysCountCellProps = {
	days: number;
};

const daysCountBadgeVariant = (days: number) => {
	if (days < 7) {
		return 'destructive';
	}
	if (days < 14) {
		return 'secondary';
	}
	if (days < 30) {
		return 'outline';
	}
	if (days < 60) {
		return 'default';
	}

	return 'verified';
};

export const DataTableDaysCountCell = ({ days }: DataTableDaysCountCellProps) => {
	const safeDays = Number.isFinite(days) ? Math.max(0, Math.floor(days)) : 0;

	return (
		<Badge variant={daysCountBadgeVariant(safeDays)}>
			<Clock3Icon className="mr-1 h-4 w-4" />
			{safeDays === 0 ? 'Today' : `In ${safeDays} day${safeDays === 1 ? '' : 's'}`}
		</Badge>
	);
};

type DataTableProgressCellProps = {
	percent: number;
	received: number;
	total: number;
	/** Highlights the bar when only a few items remain */
	urgent?: boolean;
};

export const DataTableProgressCell = ({ percent, received, total, urgent = false }: DataTableProgressCellProps) => (
	<div className="flex items-center gap-2">
		<Progress value={percent} variant={urgent ? 'urgent' : 'default'} />
		<span className="whitespace-nowrap">
			{received} / {total}
		</span>
	</div>
);

type DataTableGenderCellProps = {
	gender?: string | null;
};

export const DataTableGenderCell = ({ gender }: DataTableGenderCellProps) => {
	if (!gender) {
		return <span>—</span>;
	}

	if (gender === 'male') {
		return (
			<span className="inline-flex items-center gap-1">
				<ShortHairIcon size={16} />
				Male
			</span>
		);
	}

	if (gender === 'female') {
		return (
			<span className="inline-flex items-center gap-1">
				<LongHairIcon size={16} />
				Female
			</span>
		);
	}

	return <span className="capitalize">{gender}</span>;
};

type DataTableIdCellProps = {
	id: string;
};

export const DataTableIdCell = ({ id }: DataTableIdCellProps) => {
	const { copied, copy } = useCopyToClipboard(1200);

	if (!id) {
		return <span>—</span>;
	}

	const onCopy = (event: MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		event.stopPropagation();
		copy(id);
	};

	return (
		<div className="flex items-center gap-2">
			<span className="max-w-[220px] truncate font-mono text-xs" title={id}>
				{id}
			</span>
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				onClick={onCopy}
				aria-label={copied ? 'ID copied' : 'Copy ID to clipboard'}
			>
				{copied ? <Check className="text-confirm h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
			</Button>
		</div>
	);
};

type DataTableCopyUrlCellProps = {
	url: string;
};

export const DataTableCopyUrlCell = ({ url }: DataTableCopyUrlCellProps) => {
	const { copied, copy } = useCopyToClipboard(1500);

	if (!url) {
		return null;
	}

	const onCopy = (event: MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();
		copy(url);
	};

	return (
		<Button variant="outline" size="sm" onClick={onCopy}>
			{copied ? (
				<>
					<Check className="text-confirm mr-2 h-4 w-4" />
					Copied!
				</>
			) : (
				<>
					<Copy className="mr-2 h-4 w-4" />
					Copy URL
				</>
			)}
		</Button>
	);
};

type DataTableDownloadCellProps = {
	href?: string;
	/** The file exists but cannot be downloaded */
	unavailable?: boolean;
};

export const DataTableDownloadCell = ({ href, unavailable = false }: DataTableDownloadCellProps) => {
	if (unavailable) {
		return <span className="text-muted-foreground text-sm">Download unavailable</span>;
	}

	if (!href) {
		return null;
	}

	return (
		<Link
			className="text-primary inline-flex items-center font-medium underline-offset-4 hover:underline"
			href={href}
			target="_blank"
			rel="noopener noreferrer"
		>
			<Download className="mr-2 h-4 w-4" />
			Download
		</Link>
	);
};

/** Chevron hinting that the row opens a detail view */
export const DataTableRowChevronCell = () => (
	<div className="flex items-center justify-center opacity-70" aria-hidden="true" data-testid="action-cell-icon">
		<ChevronRightIcon className="h-5 w-5 transition-transform duration-200 ease-out group-hover/row:translate-x-1" />
	</div>
);
