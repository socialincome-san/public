import { CardAlertFooter, type CardAlertFooterVariant } from '@/components/card-alert-footer';
import { cn } from '@/lib/utils/cn';
import NextLink from 'next/link';
import { FocusSdgs } from './focus-sdgs';
import type { SdgValue } from './sdgs';

type FocusDetailCardLabels = {
	recipients: string;
	programs: string;
	sdgs: string;
	candidatesReady?: string;
};

type FocusDetailCardProps = {
	href: string;
	focusTitle: string;
	recipientsCount: number;
	programsCount: number;
	sdgValues?: SdgValue[];
	alertVariant?: CardAlertFooterVariant;
	labels: FocusDetailCardLabels;
};

type FocusDetailCardStatProps = {
	value: number;
	label: string;
};

const FocusDetailCardStat = ({ value, label }: FocusDetailCardStatProps) => (
	<div className="flex flex-col gap-0">
		<div className="text-2xl font-semibold text-slate-600">{value}</div>
		<div className="text-sm font-medium text-slate-600">{label}</div>
	</div>
);

export const FocusDetailCard = ({
	href,
	focusTitle,
	recipientsCount,
	programsCount,
	sdgValues,
	alertVariant = 'confirm',
	labels,
}: FocusDetailCardProps) => {
	const titleId = `focus-card-title-${href}`;

	return (
		<div
			className={cn(
				'flex h-full flex-col rounded-2xl drop-shadow-md',
				alertVariant === 'confirm' ? 'bg-confirm-foreground' : 'bg-secondary',
			)}
		>
			<div className="border-border relative flex min-w-0 flex-1 flex-col gap-3 rounded-2xl border bg-white p-6">
				<NextLink
					href={href}
					className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-950"
					aria-labelledby={titleId}
				/>
				<div className="pointer-events-none relative flex flex-col gap-3">
					<h2
						id={titleId}
						className="line-clamp-2 min-h-18 min-w-0 font-sans text-3xl leading-9 font-medium wrap-break-word text-cyan-950"
					>
						{focusTitle}
					</h2>
					<div className="grid grid-cols-3 gap-3">
						<FocusDetailCardStat value={recipientsCount} label={labels.recipients} />
						<FocusDetailCardStat value={programsCount} label={labels.programs} />
						<FocusSdgs values={sdgValues} label={labels.sdgs} />
					</div>
				</div>
			</div>
			{labels.candidatesReady ? <CardAlertFooter text={labels.candidatesReady} variant={alertVariant} /> : null}
		</div>
	);
};
