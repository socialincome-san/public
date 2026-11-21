import type { AnySearchParams } from '@/app/page-props';
import SentMailsTable from '@/app/portal/admin/sent-mails/sent-mails-table';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { getEmailCatalogDetail, getPaginatedSentEmailTableView } from '@/modules/mail/mail.service';
import type { EmailCatalogDetail } from '@/modules/mail/mail.types';
import { requireAdmin } from '@/server/session';
import { Badge } from '@socialincome/design-system/data-display/badge/badge';
import { EmailPreview } from '@socialincome/design-system/data-display/email-preview/email-preview';
import { RecordSummary } from '@socialincome/design-system/data-display/record-summary/record-summary';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@socialincome/design-system/data-display/table/table';
import { Alert, AlertDescription } from '@socialincome/design-system/feedback/alert/alert';
import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';
import { Suspense } from 'react';

type EmailPageProps = {
	params: Promise<{ key: string }>;
	searchParams: Promise<AnySearchParams>;
};

export default function EmailPage(props: EmailPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<EmailDataLoader {...props} />
		</Suspense>
	);
}

const EmailDataLoader = async ({ params, searchParams }: EmailPageProps) => {
	const user = await requireAdmin();
	const { key } = await params;
	const result = await getEmailCatalogDetail(user.id, key);
	if (!result.success) {
		return (
			<Alert variant="destructive">
				<AlertDescription>{result.error}</AlertDescription>
			</Alert>
		);
	}

	const email = result.data;
	const tableQuery = tableQueryFromSearchParams(await searchParams);
	const logResult = email.status === 'live' ? await getPaginatedSentEmailTableView(user.id, tableQuery, key) : null;

	return (
		<div className="space-y-10">
			<RecordSummary
				title={email.name}
				identifier={email.key}
				aside={<Badge variant={statusBadgeVariant[email.status]}>{email.status}</Badge>}
				columns={4}
				fields={[
					{ label: 'What', value: email.description },
					{ label: 'When', value: email.trigger },
					{ label: 'Sent by', value: email.source },
					{ label: 'Audience', value: `${email.audience} · ${email.category}` },
					{ label: 'Languages', badges: email.languages },
					{ label: 'Receivers', value: receiversLabel(email) },
					{ label: 'Sent', value: email.sentCount },
					{ label: 'Last sent', value: email.lastSentAt ? dateFormat.format(email.lastSentAt) : '—' },
				]}
				section={{ title: sectionTitle(email), content: <EmailDetailSection email={email} /> }}
			/>

			{logResult && (
				<SentMailsTable
					rows={logResult.success ? logResult.data.tableRows : []}
					error={logResult.success ? null : logResult.error}
					query={{ ...tableQuery, totalRows: logResult.success ? logResult.data.totalCount : 0 }}
				/>
			)}
		</div>
	);
};

const EmailDetailSection = ({ email }: { email: EmailCatalogDetail }) => {
	if (email.preview) {
		return (
			<EmailPreview
				headers={[
					{ label: 'From', value: email.preview.from },
					{ label: 'To', value: email.preview.to },
					{ label: 'Subject', value: email.preview.subject },
				]}
				body={email.preview.body}
				footnote={
					email.preview.sendgridTemplateId
						? `SendGrid renders the dynamic template ${email.preview.sendgridTemplateId} with the same data; this is the plain-text version stored in the log.`
						: 'Rendered with sample data.'
				}
			/>
		);
	}

	if (email.previewError || email.automationsError) {
		return (
			<Alert variant="destructive">
				<AlertDescription>{email.previewError ?? email.automationsError}</AlertDescription>
			</Alert>
		);
	}

	if (email.automations.length > 0) {
		return (
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Automation</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Step</TableHead>
						<TableHead>When</TableHead>
						<TableHead>Subject</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{email.automations.flatMap((automation) =>
						automation.steps.map((step, index) => (
							<TableRow key={`${automation.name}-${step.subject}`}>
								<TableCell>{automation.name}</TableCell>
								<TableCell>
									<Badge variant={automation.status === 'live' ? 'verified' : 'secondary'}>{automation.status}</Badge>
								</TableCell>
								<TableCell>{index + 1}</TableCell>
								<TableCell>{step.delay}</TableCell>
								<TableCell>{step.subject}</TableCell>
							</TableRow>
						)),
					)}
				</TableBody>
			</Table>
		);
	}

	return (
		<Alert>
			<AlertDescription>
				{email.status === 'planned'
					? 'Not built yet. Once it is, the preview and every sent email show up here.'
					: `Sent by ${email.source}; its content and log live there, not in this portal.`}
			</AlertDescription>
		</Alert>
	);
};

const statusBadgeVariant = { live: 'verified', planned: 'secondary', external: 'default' } as const;

const dateFormat = new Intl.DateTimeFormat('de-CH', { dateStyle: 'short', timeStyle: 'short' });

const receiversLabel = (email: EmailCatalogDetail) => {
	if (email.status !== 'live') {
		return '—';
	}
	if (email.audience === 'staff') {
		return email.receivers.length > 0 ? email.receivers.join(', ') : 'Not set';
	}

	return email.audience;
};

const sectionTitle = (email: EmailCatalogDetail) => {
	if (email.preview) {
		return 'Preview with sample data';
	}

	return email.automations.length > 0 ? 'SendGrid automation, live from SendGrid' : 'Content';
};
