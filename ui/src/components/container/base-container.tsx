import { PropsWithChildren } from 'react';
import classNames from 'classnames';

interface BaseContainerProps {
	className?: string;
}

export function BaseContainer({ children, className }: PropsWithChildren<BaseContainerProps>) {
	return (
		<div className={className}>
			<div className={classNames('max-w-7xl mx-auto px-5')}>{children}</div>
		</div>
	);
}
