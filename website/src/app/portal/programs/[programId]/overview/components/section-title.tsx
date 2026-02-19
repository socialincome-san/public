import { PropsWithChildren } from 'react';

export function SectionTitle({ children }: PropsWithChildren) {
	return <h2 className="text-xl font-medium">{children}</h2>;
}
