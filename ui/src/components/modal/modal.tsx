'use client';

import { Button } from '../index';
import { PropsWithChildren, useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import classNames from 'classnames';

type ModalProps = {
	isOpen?: boolean;
	showCloseButton?: boolean;
	width?: 'regular' | 'wide' | 'full';
};

const MODAL_WITH_MAP = {
	regular: '',
	wide: 'w-4/6',
	full: 'w-11/12 max-w-7xl',
};

export function Modal({ children, showCloseButton = false, isOpen, width = 'regular' }: PropsWithChildren<ModalProps>) {
	const ref = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		if (isOpen) {
			ref.current?.showModal();
		}
		return () => ref.current?.close();
	}, [ref, isOpen]);

	return (
		<>
			<dialog ref={ref} className="modal">
				<form method="dialog" className={classNames('modal-box w-11/12', MODAL_WITH_MAP[width])}>
					{showCloseButton && (
						<Button size="sm" variant="ghost" shape="circle" className="absolute right-2 top-2">
							<XMarkIcon className="h-4 w-4" />
						</Button>
					)}
					{children}
				</form>
				<form method="dialog" className="modal-backdrop">
					<button>close</button>
				</form>
			</dialog>
		</>
	);
}
