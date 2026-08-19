import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tool-tip';
import { InfoIcon } from 'lucide-react';
import { getSdg, type SdgValue } from './sdgs';

type Props = {
	values?: SdgValue[];
	label: string;
	layout?: 'stacked' | 'row';
};

const resolveSdgs = (values: SdgValue[]) => {
	const sdgsByNumber = new Map<number, NonNullable<ReturnType<typeof getSdg>>>();

	for (const value of values) {
		const sdg = getSdg(value);
		if (sdg) {
			sdgsByNumber.set(sdg.number, sdg);
		}
	}

	return [...sdgsByNumber.values()];
};

export const FocusSdgs = ({ values = [], label, layout = 'stacked' }: Props) => {
	const sdgs = resolveSdgs(values);
	const badges = (
		<div className="flex min-h-7 flex-wrap items-center gap-1">
			{sdgs.length > 0 ? (
				sdgs.map((sdg) => (
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
	);
	const labelWithTooltip = (
		<div className="flex items-center gap-1 text-sm font-medium text-slate-600">
			<span>{label}</span>
			{sdgs.length > 0 ? (
				<Tooltip>
					<TooltipTrigger asChild>
						<button
							type="button"
							className="pointer-events-auto relative z-10 inline-flex text-slate-600 hover:text-slate-950"
							aria-label={`${label} information`}
						>
							<InfoIcon className="size-3" aria-hidden />
						</button>
					</TooltipTrigger>
					<TooltipContent sideOffset={8} className="max-w-[280px]">
						<ul>
							{sdgs.map((sdg) => (
								<li key={sdg.number}>{`SDG ${sdg.number}: ${sdg.title}`}</li>
							))}
						</ul>
					</TooltipContent>
				</Tooltip>
			) : null}
		</div>
	);

	return (
		<div
			className={
				layout === 'stacked'
					? 'flex flex-col gap-0'
					: 'grid gap-3 py-4 sm:grid-cols-[140px_1fr] sm:items-center'
			}
		>
			{layout === 'stacked' ? (
				<>
					{badges}
					{labelWithTooltip}
				</>
			) : (
				<>
					{labelWithTooltip}
					{badges}
				</>
			)}
		</div>
	);
};
