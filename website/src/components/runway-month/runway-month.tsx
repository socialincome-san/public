import { Check } from 'lucide-react';

type Props = {
	month: string;
	year: number;
};

export const RunwayMonth = ({ month, year }: Props) => {
	return (
		<div className="bg-confirm-foreground text-primary h-20 w-25 overflow-hidden rounded-xl shadow-md">
			<div className="border-primary/20 text-md leading flex h-2/3 flex-col items-center justify-center rounded-xl border bg-white text-center leading-none font-normal">
				<span>{month}</span>
				<span>{year}</span>
			</div>
			<div className="flex h-1/3 items-center justify-center">
				<Check className="h-3.5 w-3.5" aria-hidden />
			</div>
		</div>
	);
};
