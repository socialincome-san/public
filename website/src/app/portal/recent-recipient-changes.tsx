import { sourceLabels, summarizeRecipientChange } from '@/components/recipient-changes/recipient-change-summary';
import { getRecipientChangeTableView } from '@/modules/recipients/recipient.service';
import { Button } from '@socialincome/design-system/actions/button/button';
import { BreakdownList, BreakdownRow } from '@socialincome/design-system/data-display/breakdown-list/breakdown-list';
import { Card } from '@socialincome/design-system/data-display/card/card';
import Link from 'next/link';

const dateFormat = new Intl.DateTimeFormat('de-CH', { dateStyle: 'short', timeStyle: 'short' });

export const RecentRecipientChanges = async ({ userId }: { userId: string }) => {
	const result = await getRecipientChangeTableView(userId, { page: 1, pageSize: 5, search: '' });
	if (!result.success || result.data.tableRows.length === 0) {
		return null;
	}

	return (
		<section>
			<h2 className="py-6 text-3xl font-medium">Recent recipient changes</h2>
			<div className="flex flex-col items-start gap-6">
				<Card elevation="flat" padding="compact">
					<BreakdownList ariaLabel="Recent recipient changes">
						{result.data.tableRows.map((row) => (
							<BreakdownRow
								key={row.id}
								label={row.recipientName}
								value={dateFormat.format(row.createdAt)}
								description={`${summarizeRecipientChange(row)} · ${row.actorName}, ${sourceLabels[row.source] ?? row.source}`}
							/>
						))}
					</BreakdownList>
				</Card>
				<Button asChild variant="outline">
					<Link href="/portal/monitoring/recipient-changes">All recipient changes</Link>
				</Button>
			</div>
		</section>
	);
};
