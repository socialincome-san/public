import { type ReactNode } from 'react';

type EmailPreviewProps = {
	// Envelope lines such as From, To and Subject, in display order
	headers: { label: string; value: string }[];
	body: string;
	// e.g. a note that the provider renders a different layout
	footnote?: ReactNode;
};

export const EmailPreview = ({ headers, body, footnote }: EmailPreviewProps) => (
	<figure className="border-border overflow-hidden rounded-xl border">
		<dl className="bg-muted border-border grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 border-b px-4 py-3 text-sm">
			{headers.map((header) => (
				<div key={header.label} className="contents">
					<dt className="text-muted-foreground">{header.label}</dt>
					<dd className="min-w-0 break-words">{header.value || '—'}</dd>
				</div>
			))}
		</dl>
		<pre className="bg-background overflow-x-auto px-4 py-4 font-sans text-sm whitespace-pre-wrap">{body}</pre>
		{footnote ? (
			<figcaption className="text-muted-foreground border-border border-t px-4 py-2 text-xs">{footnote}</figcaption>
		) : null}
	</figure>
);
