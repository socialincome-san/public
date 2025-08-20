'use client';

import { ReactNode } from 'react';

type Props = {
	title: ReactNode;
	error?: string | null;
	isEmpty: boolean;
	emptyMessage: string;
	actions?: ReactNode;
	children: ReactNode;
};

export default function TableWrapper({ title, error, isEmpty, emptyMessage, actions, children }: Props) {
	return (
		<div>
			{error ? (
				<div className="p-4 text-red-600">Error: {error}</div>
			) : isEmpty ? (
				<div className="p-4 text-gray-500">{emptyMessage}</div>
			) : (
				<>
					<div className="mb-4 flex items-center justify-between">
						<h2 className="pb-4 text-3xl">{title}</h2>
						{actions ?? null}
					</div>
					{children}
				</>
			)}
		</div>
	);
}
