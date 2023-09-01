import classNames from 'classnames';
import { PropsWithChildren } from 'react';

interface BaseContainerProps {
	className?: string;
}

export function BaseContainer({ children, className }: PropsWithChildren<BaseContainerProps>) {
	return (
		<div className={className}>
			<div className={classNames('mx-auto max-w-6xl px-2 sm:px-5')}>{children}</div>
		</div>
	);
}
