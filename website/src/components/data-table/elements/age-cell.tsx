'use client';

import { now } from '@/lib/utils/now';
import { CellContext } from '@tanstack/react-table';
import { differenceInYears } from 'date-fns';

const calculateAge = (date: Date | string | null): number | null => {
	if (!date) {
		return null;
	}

	const birthDate = typeof date === 'string' ? new Date(date) : date;
	if (isNaN(birthDate.getTime())) {
		return null;
	}

	const today = now();
	const age = differenceInYears(today, birthDate);

	return age >= 0 ? age : null;
}

type AgeCellProps<TData, TValue> = {
	ctx: CellContext<TData, TValue>;
};

export const AgeCell = <TData, TValue>({ ctx }: AgeCellProps<TData, TValue>) => {
	const date = ctx.getValue() as Date | string | null;
	const age = calculateAge(date);

	if (age === null) {
		return <span className="text-muted-foreground">–</span>;
	}

	return <span>{age}</span>;
}
