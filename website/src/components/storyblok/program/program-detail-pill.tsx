import { ChevronRight } from 'lucide-react';

type Props = {
	label: string;
};

export const ProgramDetailPill = ({ label }: Props) => {
	return (
		<button type="button" className="flex items-center gap-1.5 rounded-full bg-slate-100 py-1.5 pr-2 pl-3">
			<span className="text-foreground text-xs font-bold">{label}</span>
			<ChevronRight className="text-foreground size-4" />
		</button>
	);
};
