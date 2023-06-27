import classNames from 'classnames';
import { Children, isValidElement, PropsWithChildren, ReactElement } from 'react';
import { DefaultComponentProps } from '../index';
import { DropdownItem } from './dropdown-item';
import { DropdownLabel } from './dropdown-label';

interface DropdownProps extends DefaultComponentProps {
	openOnHover?: boolean;
	isOpen?: boolean;
	position?: 'top' | 'bottom' | 'left' | 'right';
	alignEnd?: boolean;
}

export function Dropdown({ children, ...props }: PropsWithChildren<DropdownProps>) {
	let label: ReactElement | null = null;
	const items: ReactElement[] = [];

	Children.forEach(children, (child) => {
		if (!isValidElement(child)) throw new Error('Invalid child element');

		switch (child.type) {
			case DropdownLabel:
				label = child;
				break;
			case DropdownItem:
				items.push(child);
				break;
			default:
				throw new Error('Invalid child element');
		}
	});

	return (
		<div
			className={classNames(
				'dropdown',
				{
					'dropdown-hover': props.openOnHover,
					'dropdown-open': props.isOpen,
					[`dropdown-${props.position}`]: props.position,
					'dropdown-end': props.alignEnd,
				},
				props.className
			)}
		>
			{label}
			<ul tabIndex={0} className={classNames('dropdown-content menu shadow bg-base-100 rounded-box mt-4 z-50')}>
				{items.map((item) => item)}
			</ul>
		</div>
	);
}

Dropdown.Label = DropdownLabel;
Dropdown.Item = DropdownItem;
