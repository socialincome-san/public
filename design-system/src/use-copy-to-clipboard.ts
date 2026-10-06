import { useState } from 'react';

export const useCopyToClipboard = (timeout: number) => {
	const [copied, setCopied] = useState(false);

	const copy = (text: string) => {
		void navigator.clipboard.writeText(text).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), timeout);
		});
	};

	return { copied, copy };
};
