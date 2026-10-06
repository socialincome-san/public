import { StatusCard } from '@socialincome/design-system/data-display/status-card/status-card';
import { type CardAlertFooterVariant } from '@socialincome/design-system/feedback/card-alert-footer/card-alert-footer';
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
		<div className="text-muted-foreground text-2xl font-semibold">{value}</div>
		<div className="text-muted-foreground text-sm font-medium">{label}</div>
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
		<StatusCard status={{ text: labels.candidatesReady, variant: alertVariant }}>
			<NextLink
				href={href}
				className="focus-visible:outline-foreground absolute inset-0 z-0 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2"
				aria-labelledby={titleId}
			/>
			<div className="pointer-events-none relative flex flex-col gap-3">
				<h2
					id={titleId}
					className="text-foreground line-clamp-2 min-h-18 min-w-0 font-sans text-3xl leading-9 font-medium wrap-break-word"
				>
					{focusTitle}
				</h2>
				<div className="grid grid-cols-3 gap-3">
					<FocusDetailCardStat value={recipientsCount} label={labels.recipients} />
					<FocusDetailCardStat value={programsCount} label={labels.programs} />
					<FocusSdgs values={sdgValues} label={labels.sdgs} />
				</div>
			</div>
		</StatusCard>
	);
};
