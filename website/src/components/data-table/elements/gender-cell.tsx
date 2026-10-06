import { CellType } from '@/components/data-table/elements/types';
import { Gender } from '@/generated/prisma/enums';
import { LongHairIcon, ShortHairIcon } from '@socialincome/design-system/icons/custom-icons/custom-icons';
import type { RowData } from '@tanstack/react-table';

export const GenderCell = <TData extends RowData, TValue>({ ctx }: CellType<TData, TValue>) => {
	const value = ctx.getValue() as Gender | null;

	if (!value) {
		return <span>—</span>;
	}

	if (value === Gender.male) {
		return (
			<span className="inline-flex items-center gap-1">
				<ShortHairIcon size={16} />
				Male
			</span>
		);
	}

	if (value === Gender.female) {
		return (
			<span className="inline-flex items-center gap-1">
				<LongHairIcon size={16} />
				Female
			</span>
		);
	}

	return <span className="capitalize">{value}</span>;
};
