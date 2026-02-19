import { PropsWithChildren } from 'react';

export function AdditionalNumbers({ children }: PropsWithChildren) {
	return <div className="mt-auto grid grid-cols-2 gap-4 py-4 text-sm">{children}</div>;
}
