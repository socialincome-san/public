import { EntityCollectionView, useAuthController } from '@camberi/firecms';
import { EntityCollection } from '@camberi/firecms/dist/types';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { RECIPIENT_FIRESTORE_PATH } from '@socialincome/shared/src/types';
import { useState } from 'react';
import { buildRecipientsCollection, buildRecipientsRecentPaymentsCollection } from '../collections';
import { buildRecipientsCashTransfersCollection } from '../collections/recipients/RecipientsCashTransfers';

type RecipientViewOptions = 'all' | 'cashTransfers' | 'recentPayments';

export function RecipientsView() {
	const authController = useAuthController();
	const isGlobalAdmin = !!authController.extra?.isGlobalAdmin;
	const [activeView, setActiveView] = useState<RecipientViewOptions>('cashTransfers');

	// The 'in' filter for organisation does not support empty arrays
	if (!isGlobalAdmin && !(authController.extra?.organisations?.length > 0)) {
		return <Box>No organisations found</Box>;
	}

	let activeCollection: EntityCollection;
	switch (activeView) {
		case 'all':
			activeCollection = buildRecipientsCollection({
				isGlobalAdmin,
				organisations: authController.extra?.organisations,
			});
			break;
		case 'recentPayments':
			activeCollection = buildRecipientsRecentPaymentsCollection({
				isGlobalAdmin,
				organisations: authController.extra?.organisations,
			});
			break;
		case 'cashTransfers':
			activeCollection = buildRecipientsCashTransfersCollection({ isGlobalAdmin });
			break;
	}

	return (
		<Box display="flex" flexDirection="column" width="100%" height="100%" alignItems="flex-start">
			<ToggleButtonGroup color="primary" value={activeView} exclusive onChange={(event, value) => setActiveView(value)}>
				<ToggleButton value="cashTransfers">Cash Transfers</ToggleButton>
				<ToggleButton value="recentPayments">Recent Payments</ToggleButton>
				<ToggleButton value="all">All Recipients</ToggleButton>
			</ToggleButtonGroup>
			<EntityCollectionView {...activeCollection} fullPath={RECIPIENT_FIRESTORE_PATH} />
		</Box>
	);
}
