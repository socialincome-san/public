import { PropsWithChildren } from 'react';
import classNames from 'classnames';

interface BaseContainerProps {
	className?: string;
}

export function BaseContainer({ children, className }: PropsWithChildren<BaseContainerProps>) {
	return (
		<div className={className}>
			<div className={classNames('mx-auto max-w-7xl px-5')}>{children}</div>
		</div>
	);
}
