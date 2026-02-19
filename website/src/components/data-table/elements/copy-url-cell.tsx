'use client';

import { Button } from '@/components/button';
import { CellType } from '@/components/data-table/elements/types';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

const useCopyToClipboard = (timeout = 1500) => {
	const [copied, setCopied] = useState(false);

	const copy = (text: string) => {
		if (!text) {
			return;
		}
		navigator.clipboard.writeText(text).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), timeout);
		});
	};

	return { copied, copy };
};

export const CopyUrlCell = <TData, TValue>({ ctx }: CellType<TData, TValue>) => {
	const url = String(ctx.getValue() ?? '');
	const { copied, copy } = useCopyToClipboard();

	if (!url) {
		return null;
	}

	const handleCopy = (e: React.MouseEvent) => {
		e.stopPropagation();
		copy(url);
	};

	return (
		<Button variant="outline" size="sm" onClick={handleCopy} className="h-8">
			{copied ? (
				<>
					<Check className="mr-2 h-4 w-4 text-green-600" />
					Copied!
				</>
			) : (
				<>
					<Copy className="mr-2 h-4 w-4" />
					Copy URL
				</>
			)}
		</Button>
	);
}
