import { EntityCollectionView, useAuthController } from '@camberi/firecms';
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

	return (
		<Box display="flex" flexDirection="column" width="100%" height="100%" alignItems="flex-start">
			<ToggleButtonGroup color="primary" value={activeView} exclusive onChange={(event, value) => setActiveView(value)}>
				<ToggleButton value="cashTransfers">Cash Transfers</ToggleButton>
				<ToggleButton value="recentPayments">Recent Payments</ToggleButton>
				<ToggleButton value="all">All Recipients</ToggleButton>
			</ToggleButtonGroup>
			{activeView === 'all' && (
				<EntityCollectionView
					{...buildRecipientsCollection({
						isGlobalAdmin,
						organisations: authController.extra?.organisations,
					})}
					fullPath={RECIPIENT_FIRESTORE_PATH}
				/>
			)}
			{activeView === 'recentPayments' && (
				<EntityCollectionView
					{...buildRecipientsRecentPaymentsCollection({
						isGlobalAdmin,
						organisations: authController.extra?.organisations,
					})}
					fullPath={RECIPIENT_FIRESTORE_PATH}
				/>
			)}
			{activeView === 'cashTransfers' && (
				<EntityCollectionView
					{...buildRecipientsCashTransfersCollection({
						isGlobalAdmin,
						organisations: authController.extra?.organisations,
					})}
					fullPath={RECIPIENT_FIRESTORE_PATH}
				/>
			)}
		</Box>
	);
}
