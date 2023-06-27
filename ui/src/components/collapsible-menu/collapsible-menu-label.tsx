import { PropsWithChildren } from 'react';
import { DefaultComponentProps } from '../index';

interface CollapsibleMenuLabelProps extends DefaultComponentProps {}

export function CollapsibleMenuLabel({ children, ...props }: PropsWithChildren<CollapsibleMenuLabelProps>) {
	return (
		<summary tabIndex={0} className={props.className}>
			{children}
		</summary>
	);
}
