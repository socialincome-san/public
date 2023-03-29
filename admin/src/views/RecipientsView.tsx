import { EntityCollectionView, useAuthController } from '@camberi/firecms';
import { Box, Button, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { recipientSurveys, RECIPIENT_FIRESTORE_PATH } from '@socialincome/shared/src/types';
import { useState } from 'react';
import { buildRecipientsCollection, buildRecipientsRecentPaymentsCollection } from '../collections';
import { buildRecipientsCashTransfersCollection } from '../collections/recipients/RecipientsCashTransfers';
import { buildRecipientsSurveysCollection } from '../collections/recipients/RecipientsSurveys';
import { createPendingSurveyColumn, createSurveyColumn } from '../collections/surveys/Surveys';
import { PaymentProcessModal } from '../components/PaymentProcessModal';

type RecipientViewOptions = 'all' | 'cashTransfers' | 'recentPayments' | 'currentSurveys' | 'allSurveys';

export function RecipientsView() {
	const authController = useAuthController();
	const isGlobalAdmin = !!authController.extra?.isGlobalAdmin;
	const [activeView, setActiveView] = useState<RecipientViewOptions>('cashTransfers');
	const [showDownloadCSVModal, setShowDownloadCSVModal] = useState(false);

	// The 'in' filter for organisation does not support empty arrays
	if (!isGlobalAdmin && !(authController.extra?.organisations?.length > 0)) {
		return <Box>No organisations found</Box>;
	}

	return (
		<>
			<Box display="flex" flexDirection="column" width="100%" height="100%" alignItems="flex-start">
				<Box display="flex" flexDirection="row" justifyContent="space-between" width="100%">
					<ToggleButtonGroup
						color="primary"
						value={activeView}
						exclusive
						onChange={(event, value) => setActiveView(value)}
					>
						<ToggleButton value="cashTransfers">Cash Transfers</ToggleButton>
						<ToggleButton value="recentPayments">Recent Payments</ToggleButton>
						<ToggleButton value="all">All Recipients</ToggleButton>
						<ToggleButton value="currentSurveys">Current Surveys</ToggleButton>
						<ToggleButton value="allSurveys">All Surveys</ToggleButton>
					</ToggleButtonGroup>
					<Button variant="text" size="small" onClick={() => setShowDownloadCSVModal(true)}>
						Payment Process
					</Button>
				</Box>
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
				{/*// TODO how should have access?*/}
				{isGlobalAdmin && activeView === 'currentSurveys' && (
					<EntityCollectionView
						{...buildRecipientsSurveysCollection([createPendingSurveyColumn(0)])}
						fullPath={RECIPIENT_FIRESTORE_PATH}
					/>
				)}
				{isGlobalAdmin && activeView === 'allSurveys' && (
					<EntityCollectionView
						{...buildRecipientsSurveysCollection(recipientSurveys.map((s) => createSurveyColumn(s.name)))}
						fullPath={RECIPIENT_FIRESTORE_PATH}
					/>
				)}
			</Box>
			<PaymentProcessModal isOpen={showDownloadCSVModal} handleClose={() => setShowDownloadCSVModal(false)} />
		</>
	);
}
