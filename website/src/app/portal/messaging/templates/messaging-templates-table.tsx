import type { TwilioTemplateSummary } from '@/modules/messaging/messaging.types';
import { Badge } from '@socialincome/design-system/data-display/badge/badge';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@socialincome/design-system/data-display/table/table';
import Link from 'next/link';

type MessagingTemplatesTableProps = {
	templates: TwilioTemplateSummary[];
	error: string | null;
};

const statusVariant = (status: string | null) => {
	switch (status) {
		case 'approved':
			return 'verified';
		case 'rejected':
			return 'destructive';
		case 'pending':
			return 'secondary';
		default:
			return 'default';
	}
};

export const MessagingTemplatesTable = ({ templates, error }: MessagingTemplatesTableProps) => {
	if (error) {
		return <p className="text-destructive text-sm">{error}</p>;
	}

	if (templates.length === 0) {
		return <p className="text-muted-foreground text-sm">No content templates found.</p>;
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Name</TableHead>
					<TableHead>SID</TableHead>
					<TableHead>Language</TableHead>
					<TableHead>Type</TableHead>
					<TableHead>WhatsApp</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{templates.map((template) => (
					<TableRow key={template.sid}>
						<TableCell>
							<Link href={`/portal/messaging/templates/${template.sid}`} className="font-medium hover:underline">
								{template.friendlyName}
							</Link>
						</TableCell>
						<TableCell>
							<span className="font-mono text-xs">{template.sid}</span>
						</TableCell>
						<TableCell>{template.language}</TableCell>
						<TableCell>{template.contentType ?? '—'}</TableCell>
						<TableCell>
							{template.whatsappStatus ? (
								<Badge variant={statusVariant(template.whatsappStatus)}>
									{template.whatsappStatus}
									{template.whatsappCategory ? ` · ${template.whatsappCategory}` : ''}
								</Badge>
							) : (
								<span className="text-muted-foreground">—</span>
							)}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
};
