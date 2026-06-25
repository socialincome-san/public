'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

export const PreviewMessage = () => {
	const [visible, setVisible] = useState(true);

	if (!visible) {
		return null;
	}

	return (
		<aside className="border-border bg-card fixed top-24 left-4 z-50 max-w-[200px] rounded-xl border p-3 shadow-lg">
			<div className="flex items-start justify-between gap-2">
				<p className="text-sm font-bold">Preview mode</p>
				<button
					type="button"
					className="text-muted-foreground hover:text-foreground"
					aria-label="Dismiss preview notice"
					onClick={() => setVisible(false)}
				>
					<X className="size-4" />
				</button>
			</div>
			<p className="text-muted-foreground mt-2 text-xs leading-snug">
				Published changes can take a few minutes. Unpublished stories are visible here.
			</p>
		</aside>
	);
};
