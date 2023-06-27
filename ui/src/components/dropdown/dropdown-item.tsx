import { PropsWithChildren } from 'react';

interface DropdownItemProps {
	href?: string;
	onClick?: () => void;
}

export function DropdownItem({ children, href, onClick }: PropsWithChildren<DropdownItemProps>) {
	switch (typeof children) {
		case 'string':
			return (
				<li>
					<a href={href} onClick={onClick}>
						{children}
					</a>
				</li>
			);
		default:
			return <li>{children}</li>;
	}
}
