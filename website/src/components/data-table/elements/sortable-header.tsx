'use client';

import { HeaderType } from './types';

export const SortableHeader = <TData, TValue>({ ctx, children }: HeaderType<TData, TValue>) => {
	void ctx;
	return <span>{children}</span>;
};
