import { ReactNode } from 'react';

export default function TableWrapper({
	error,
	isEmpty,
	children,
	emptyMessage = 'No data found',
}: {
	error?: string | null;
	isEmpty: boolean;
	children: ReactNode;
	emptyMessage?: string;
}) {
	if (error) return <div className="p-4">Error: {error}</div>;
	if (isEmpty) return <div className="p-4">{emptyMessage}</div>;
	return <>{children}</>;
}
