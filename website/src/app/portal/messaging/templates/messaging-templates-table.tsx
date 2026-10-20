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
import { getTranslations } from 'next-intl/server';
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

const statusLabel = (status: string, labels: { approved: string; rejected: string; pending: string }) => {
	switch (status) {
		case 'approved':
			return labels.approved;
		case 'rejected':
			return labels.rejected;
		case 'pending':
			return labels.pending;
		default:
			return status;
	}
};

export const MessagingTemplatesTable = async ({ templates, error }: MessagingTemplatesTableProps) => {
	const t = await getTranslations('portal-messaging');
	const templateStatusLabels = {
		approved: t('status.templates.approved'),
		rejected: t('status.templates.rejected'),
		pending: t('status.templates.pending'),
	};

	if (error) {
		return <p className="text-destructive text-sm">{t('common.errorDetails', { error })}</p>;
	}

	if (templates.length === 0) {
		return <p className="text-muted-foreground text-sm">{t('templates.empty')}</p>;
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>{t('templates.columns.name')}</TableHead>
					<TableHead>{t('templates.columns.sid')}</TableHead>
					<TableHead>{t('templates.columns.language')}</TableHead>
					<TableHead>{t('templates.columns.type')}</TableHead>
					<TableHead>{t('templates.columns.whatsapp')}</TableHead>
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
									{statusLabel(template.whatsappStatus, templateStatusLabels)}
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
