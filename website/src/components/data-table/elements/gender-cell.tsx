import { CellType } from '@/components/data-table/elements/types';
import { Gender } from '@/generated/prisma/enums';
import { Mars, Venus } from 'lucide-react';

export const GenderCell = <TData, TValue>({ ctx }: CellType<TData, TValue>) => {
	const value = ctx.getValue() as Gender | null;

	if (!value) {
		return <span>—</span>;
	}

	if (value === Gender.male) {
		return (
			<span className="inline-flex items-center gap-1">
				<Mars className="h-4 w-4 text-black" />
				Male
			</span>
		);
	}

	if (value === Gender.female) {
		return (
			<span className="inline-flex items-center gap-1">
				<Venus className="h-4 w-4 text-black" />
				Female
			</span>
		);
	}

	return <span className="capitalize">{value}</span>;
};
