import { CircleDot } from 'lucide-react';
import NextLink from 'next/link';
import type { ReactNode } from 'react';

type FocusDetailCardLabels = {
	recipients: string;
	programs: string;
	sdgs: string;
	candidatesReady: string;
};

type FocusDetailCardProps = {
	href: string;
	focusTitle: string;
	recipientsCount: number;
	programsCount: number;
	sdgsValue: ReactNode;
	labels: FocusDetailCardLabels;
};

type FocusDetailCardStatProps = {
	value: ReactNode;
	label: string;
};

const FocusDetailCardStat = ({ value, label }: FocusDetailCardStatProps) => (
	<div className="flex flex-col gap-0">
		<div className="text-2xl font-semibold text-slate-600">{value}</div>
		<div className="text-sm font-medium text-slate-600">{label}</div>
	</div>
);

const AlertSection = ({ text }: { text: string }) => (
	<div className="flex items-center gap-2 rounded-b-2xl px-4 py-2">
		<CircleDot className="size-4 shrink-0 text-emerald-500" aria-hidden />
		<p className="text-xs font-semibold text-slate-950">{text}</p>
	</div>
);

export const FocusDetailCard = ({
	href,
	focusTitle,
	recipientsCount,
	programsCount,
	sdgsValue,
	labels,
}: FocusDetailCardProps) => (
	<div className="bg-confirm-foreground flex h-full flex-col rounded-2xl drop-shadow-md">
		<NextLink
			href={href}
			className="border-border flex min-w-0 flex-1 flex-col gap-3 rounded-2xl border bg-white p-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-950"
		>
			<h2 className="line-clamp-2 min-h-18 min-w-0 font-sans text-3xl leading-9 font-medium break-words text-cyan-950">
				{focusTitle}
			</h2>
			<div className="grid grid-cols-3 gap-3">
				<FocusDetailCardStat value={recipientsCount} label={labels.recipients} />
				<FocusDetailCardStat value={programsCount} label={labels.programs} />
				<FocusDetailCardStat value={sdgsValue} label={labels.sdgs} />
			</div>
		</NextLink>
		<AlertSection text={labels.candidatesReady} />
	</div>
);
