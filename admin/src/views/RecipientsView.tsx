import { EntityCollectionView, useAuthController } from '@camberi/firecms';
import { EntityCollection } from '@camberi/firecms/dist/types';
import { ToggleButton, ToggleButtonGroup } from '@mui/lab';
import { Box } from '@mui/material';
import { RECIPIENT_FIRESTORE_PATH } from '@socialincome/shared/src/types';
import { useState } from 'react';
import { buildRecipientsCollection, buildRecipientsRecentPaymentsCollection } from '../collections';

type RecipientViewOptions = 'all' | 'recentPayments';

export function RecipientsView() {
	const authController = useAuthController();
	const isGlobalAdmin = !!authController.extra?.isGlobalAdmin;
	const [activeView, setActiveView] = useState<RecipientViewOptions>('recentPayments');

	// The 'in' filter for organisation does not support empty arrays
	if (!isGlobalAdmin && !(authController.extra?.organisations?.length > 0)) {
		return <Box>No organisations found</Box>;
	}

	let activeCollection: EntityCollection;
	switch (activeView) {
		case 'all':
			activeCollection = buildRecipientsCollection({ isGlobalAdmin });
			break;
		case 'recentPayments':
			activeCollection = buildRecipientsRecentPaymentsCollection({
				isGlobalAdmin,
				organisations: authController.extra?.organisations,
			});
			break;
	}

	return (
		<Box display="flex" flexDirection="column" width="100%" height="100%" alignItems="flex-start">
			<ToggleButtonGroup color="primary" value={activeView} exclusive onChange={(event, value) => setActiveView(value)}>
				<ToggleButton value="recentPayments">Recent Payments</ToggleButton>
				<ToggleButton value="all">All Columns</ToggleButton>
			</ToggleButtonGroup>
			<EntityCollectionView {...activeCollection} fullPath={RECIPIENT_FIRESTORE_PATH} />
		</Box>
	);
}
