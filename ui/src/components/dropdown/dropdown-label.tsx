import { PropsWithChildren } from 'react';

interface DropdownLabelProps {}

export function DropdownLabel({ children, ...props }: PropsWithChildren<DropdownLabelProps>) {
	return (
		<label tabIndex={0} className="">
			{children}
		</label>
	);
}
