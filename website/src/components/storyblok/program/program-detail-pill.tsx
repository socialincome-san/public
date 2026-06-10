import { ChevronRight } from 'lucide-react';

type Props = {
	label: string;
};

export const ProgramDetailPill = ({ label }: Props) => {
	return (
		<span className="text-foreground inline-flex items-center gap-1.5 rounded-full bg-slate-100 py-1.5 pr-2 pl-3 text-xs font-bold">
			{label}
			<ChevronRight className="size-4 shrink-0" aria-hidden="true" />
		</span>
	);
};
