'use client';

import { Button } from '@/components/button';
import { CellType } from '@/components/data-table/elements/types';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

export const IdCell = <TData, TValue>({ ctx }: CellType<TData, TValue>) => {
	const value = ctx.getValue();
	const id = value ? String(value) : '';
	const [copied, setCopied] = useState(false);

	if (!id) {
		return <span>—</span>;
	}

	const onCopy = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		event.stopPropagation();
		void navigator.clipboard.writeText(id).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 1200);
		});
	};

	return (
		<div className="flex items-center gap-2">
			<span className="max-w-[220px] truncate font-mono text-xs" title={id}>
				{id}
			</span>
			<Button
				type="button"
				variant="ghost"
				size="icon"
				className="h-6 w-6"
				onClick={onCopy}
				aria-label={copied ? 'ID copied' : 'Copy ID to clipboard'}
			>
				{copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
			</Button>
		</div>
	);
};
