import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tool-tip';
import { CircleDot, InfoIcon } from 'lucide-react';
import NextLink from 'next/link';
import { getSdg, type SdgValue } from './sdgs';

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
	labels: FocusDetailCardLabels;
};

type FocusDetailCardStatProps = {
	value: number;
	label: string;
};

type FocusDetailCardSdgsProps = {
	values?: SdgValue[];
	label: string;
};

const FocusDetailCardStat = ({ value, label }: FocusDetailCardStatProps) => (
	<div className="flex flex-col gap-0">
		<div className="text-2xl font-semibold text-slate-600">{value}</div>
		<div className="text-sm font-medium text-slate-600">{label}</div>
	</div>
);

const FocusDetailCardSdgs = ({ values = [], label }: FocusDetailCardSdgsProps) => {
	const validSdgs = values.flatMap((value) => {
		const sdg = getSdg(value);

		return sdg ? [sdg] : [];
	});

	return (
		<div className="flex flex-col gap-0">
			<div className="flex min-h-7 items-center gap-1">
				{validSdgs.length > 0 ? (
					validSdgs.map((sdg) => (
						<span
							key={sdg.number}
							className="flex size-5 items-center justify-center rounded-full text-xs leading-none font-semibold text-white"
							style={{ backgroundColor: sdg.color }}
							title={sdg.title}
							aria-label={`SDG ${sdg.number}: ${sdg.title}`}
						>
							{sdg.number}
						</span>
					))
				) : (
					<span className="text-2xl font-semibold text-slate-600" aria-hidden>
						-
					</span>
				)}
			</div>
			<div className="flex items-center gap-1 text-sm font-medium text-slate-600">
				<span>{label}</span>
				{validSdgs.length > 0 ? (
					<Tooltip>
						<TooltipTrigger asChild>
							<span className="inline-flex cursor-help text-slate-600 hover:text-slate-950">
								<InfoIcon className="size-[12px]" aria-hidden />
							</span>
						</TooltipTrigger>
						<TooltipContent sideOffset={8} className="max-w-[280px]">
							<ul>
								{validSdgs.map((sdg) => (
									<li key={sdg.number}>{`SDG ${sdg.number}: ${sdg.title}`}</li>
								))}
							</ul>
						</TooltipContent>
					</Tooltip>
				) : null}
			</div>
		</div>
	);
};

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
	sdgValues,
	labels,
}: FocusDetailCardProps) => (
	<div className="bg-confirm-foreground flex h-full flex-col rounded-2xl drop-shadow-md">
		<NextLink
			href={href}
			className="border-border flex min-w-0 flex-1 flex-col gap-3 rounded-2xl border bg-white p-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-950"
		>
			<h2 className="line-clamp-2 min-h-18 min-w-0 font-sans text-3xl leading-9 font-medium wrap-break-word text-cyan-950">
				{focusTitle}
			</h2>
			<div className="grid grid-cols-3 gap-3">
				<FocusDetailCardStat value={recipientsCount} label={labels.recipients} />
				<FocusDetailCardStat value={programsCount} label={labels.programs} />
				<FocusDetailCardSdgs values={sdgValues} label={labels.sdgs} />
			</div>
		</NextLink>
		{labels.candidatesReady ? <AlertSection text={labels.candidatesReady} /> : null}
	</div>
);
