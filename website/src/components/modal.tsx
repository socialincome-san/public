'use client';

import { ReactNode } from 'react';

type ModalProps = {
	open: boolean;
	onOpenChange: (next: boolean) => void;
	children?: ReactNode;
};

export function Modal({ open, onOpenChange, children }: ModalProps) {
	if (!open) return null;
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<button className="absolute inset-0 bg-black/30" onClick={() => onOpenChange(false)} aria-label="Close" />
			<div className="relative w-full max-w-md rounded bg-white p-4 shadow">{children}</div>
		</div>
	);
}
