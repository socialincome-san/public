import { Check } from 'lucide-react';

type Props = {
	month: string;
	year: number;
};

export const RunwayMonth = ({ month, year }: Props) => {
	return (
		<div className="h-20 w-24 overflow-hidden rounded-xl shadow-md">
			<div className="flex h-2/3 flex-col items-center justify-center bg-white text-center font-bold text-cyan-900">
				<span>{month}</span>
				<span>{year}</span>
			</div>
			<div className="bg-confirm-foreground flex h-1/3 items-center justify-center">
				<Check className="text-confirm h-3.5 w-3.5" aria-hidden />
			</div>
		</div>
	);
};
