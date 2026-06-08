import { CellType } from '@/components/data-table/elements/types';
import { LongHairIcon } from '@/components/icons/long-hair-icon';
import { ShortHairIcon } from '@/components/icons/short-hair-icon';
import { Gender } from '@/generated/prisma/enums';

export const GenderCell = <TData, TValue>({ ctx }: CellType<TData, TValue>) => {
	const value = ctx.getValue() as Gender | null;

	if (!value) {
		return <span>—</span>;
	}

	if (value === Gender.male) {
		return (
			<span className="inline-flex items-center gap-1">
				<ShortHairIcon className="size-4" />
				Male
			</span>
		);
	}

	if (value === Gender.female) {
		return (
			<span className="inline-flex items-center gap-1">
				<LongHairIcon className="size-4" />
				Female
			</span>
		);
	}

	return <span className="capitalize">{value}</span>;
};
