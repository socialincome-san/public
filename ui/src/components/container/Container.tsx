import { PropsWithChildren } from 'react';

export function SoContainer({ children, ...props }: PropsWithChildren) {
	return (
		<div className="max-w-3xl mx-auto" {...props}>
			{children}
		</div>
	);
}
