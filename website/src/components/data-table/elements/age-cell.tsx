'use client';

import { type CellContext } from '@/components/data-table/tanstack-table';
import { now } from '@/lib/utils/now';
import { OBFUSCATED_SENTINEL } from '@/modules/recipients/recipient.types';
import {
	DataTableTextCell,
	DataTableValueCell,
} from '@socialincome/design-system/data-display/data-table-cells/data-table-cells';
import type { RowData } from '@tanstack/react-table';
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
};

type AgeCellProps<TData extends RowData, TValue> = {
	ctx: CellContext<TData, TValue>;
};

export const AgeCell = <TData extends RowData, TValue>({ ctx }: AgeCellProps<TData, TValue>) => {
	const date = ctx.getValue() as Date | string | null;

	if (date === OBFUSCATED_SENTINEL) {
		return <DataTableTextCell value="OB" obfuscated />;
	}

	return <DataTableValueCell value={calculateAge(date)} />;
};
