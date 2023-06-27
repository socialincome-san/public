import classNames from 'classnames';
import { Children, isValidElement, PropsWithChildren, ReactElement } from 'react';
import { DefaultComponentProps } from '../index';
import { CollapsibleMenuItem } from './collapsible-menu-item';
import { CollapsibleMenuLabel } from './collapsible-menu-label';

interface CollapsibleMenuProps extends DefaultComponentProps {
	isOpen?: boolean;
}

export function CollapsibleMenu({ children, ...props }: PropsWithChildren<CollapsibleMenuProps>) {
	let label: ReactElement | null = null;
	const items: ReactElement[] = [];

	Children.forEach(children, (child) => {
		if (!isValidElement(child)) throw new Error('Invalid child element');

		switch (child.type) {
			case CollapsibleMenuLabel:
				label = child;
				break;
			case CollapsibleMenuItem:
				items.push(child);
				break;
			default:
				throw new Error('Invalid child element');
		}
	});

	return (
		<ul className={classNames('menu menu-horizontal rounded-box', props.className)}>
			<li>
				<details open={props.isOpen}>
					{label}
					<ul>{items}</ul>
				</details>
			</li>
		</ul>
	);
}

CollapsibleMenu.Label = CollapsibleMenuLabel;
CollapsibleMenu.Item = CollapsibleMenuItem;
