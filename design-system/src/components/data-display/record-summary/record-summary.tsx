import { ExternalLink } from 'lucide-react';
import { type ReactNode } from 'react';
import { Badge } from '../badge/badge';

type RecordSummaryField = { label: string; value: ReactNode } | { label: string; badges: string[] };

type RecordSummaryProps = {
	title: string;
	identifier: string;
	externalLink?: { href: string; label: string };
	aside: ReactNode;
	fields: RecordSummaryField[];
	columns: 4 | 5;
	section: { title: string; content: ReactNode };
};

const columnClasses = {
	4: 'sm:grid-cols-4',
	5: 'sm:grid-cols-3 lg:grid-cols-5',
};

const FieldValue = ({ field }: { field: RecordSummaryField }) => {
	if (!('badges' in field)) {
		return <dd className="text-sm">{field.value}</dd>;
	}

	return (
		<dd className="flex flex-wrap gap-1">
			{field.badges.length > 0 ? (
				field.badges.map((badge) => (
					<Badge key={badge} variant="default">
						{badge}
					</Badge>
				))
			) : (
				<span className="text-sm">—</span>
			)}
		</dd>
	);
};

export const RecordSummary = ({ title, identifier, externalLink, aside, fields, columns, section }: RecordSummaryProps) => (
	<section className="space-y-6">
		<header className="flex items-start justify-between gap-4">
			<div className="min-w-0 space-y-1.5">
				<h2 className="text-xl font-semibold tracking-tight">{title}</h2>
				<div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
					<span className="font-mono">{identifier}</span>
					{externalLink && (
						<a
							href={externalLink.href}
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-foreground inline-flex items-center gap-1 transition-colors"
						>
							{externalLink.label}
							<ExternalLink className="h-3 w-3" />
						</a>
					)}
				</div>
			</div>
			<div className="flex shrink-0 gap-2">{aside}</div>
		</header>

		<dl className={`grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-6 ${columnClasses[columns]}`}>
			{fields.map((field) => (
				<div key={field.label} className="space-y-1">
					<dt className="text-muted-foreground text-xs">{field.label}</dt>
					<FieldValue field={field} />
				</div>
			))}
		</dl>

		<div className="space-y-2 border-t pt-6">
			<h3 className="text-muted-foreground text-xs">{section.title}</h3>
			{section.content}
		</div>
	</section>
);
