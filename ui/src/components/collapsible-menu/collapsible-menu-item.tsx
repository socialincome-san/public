import { PropsWithChildren } from 'react';

interface CollapsibleMenuItemProps {
	href?: string;
	onClick?: () => void;
}

export function CollapsibleMenuItem({ children, href, onClick }: PropsWithChildren<CollapsibleMenuItemProps>) {
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
