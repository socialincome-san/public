import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Payment, PaymentStatus, Recipient } from '@socialincome/shared/src/types';
import {
	collectionGroup,
	getDoc,
	getFirestore,
	onSnapshot,
	or,
	orderBy,
	query,
	QueryDocumentSnapshot,
	where,
} from 'firebase/firestore';
import { buildProperty, StringPropertyPreview } from 'firecms';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';
import { paymentStatusEnumValues } from '../collections/Payments';
import { auditedUpdateDoc } from '../collections/shared';
import SearchBar from '../components/SearchBar';

function UpdatePaymentButton({ paymentDoc }: { paymentDoc: QueryDocumentSnapshot<Payment> }) {
	const [confirmed, setConfirmed] = useState<boolean>(false);

	const onConfirmation = () => {
		auditedUpdateDoc(paymentDoc.ref, { status: PaymentStatus.Confirmed });
	};

	return (
		<>
			{confirmed ? (
				<Button onClick={onConfirmation}>OK</Button>
			) : (
				<Button onClick={() => setConfirmed(true)}>Confirm</Button>
			)}
		</>
	);
}

type PaymentConfirmationRowProps = {
	paymentDoc: QueryDocumentSnapshot<Payment>;
	recipientDoc: QueryDocumentSnapshot<Recipient>;
};

export function PaymentsConfirmationView() {
	const db = getFirestore();
	const [documents, setDocuments] = useState<PaymentConfirmationRowProps[]>([]);
	const [searchTerm, setSearchTerm] = useState<string>('');

	useEffect(() => {
		onSnapshot(
			query(
				collectionGroup(db, 'payments'),
				or(where('status', '==', PaymentStatus.Paid), where('status', '==', PaymentStatus.Contested)),
				orderBy('payment_at', 'desc')
			),
			async (result) => {
				const entries: PaymentConfirmationRowProps[] = [];
				for (const paymentDoc of result.docs) {
					if (paymentDoc.ref.parent.parent) {
						entries.push({
							paymentDoc: paymentDoc as QueryDocumentSnapshot<Payment>,
							recipientDoc: (await getDoc(paymentDoc.ref.parent.parent)) as QueryDocumentSnapshot<Recipient>,
						});
					}
				}
				setDocuments(entries);
			}
		);
	}, []);

	const nameFilter = (row: PaymentConfirmationRowProps) => {
		return `${row.recipientDoc.get('first_name')} ${row.recipientDoc.get('last_name')}`
			.toLowerCase()
			.includes(searchTerm.toLowerCase());
	};

	return (
		<Box sx={{ m: 2, display: 'grid', rowGap: 2 }}>
			<SearchBar onTextSearch={(text) => setSearchTerm(text)} />
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Name</TableCell>
							<TableCell>OM ID</TableCell>
							<TableCell>Date</TableCell>
							<TableCell>Status</TableCell>
							<TableCell align="right">Confirm Payment</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{documents.filter(nameFilter).map((row) => (
							<TableRow
								key={`${row.recipientDoc.id}-${row.paymentDoc.id}`}
								sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
							>
								<TableCell component="th" scope="row">
									{row.recipientDoc.get('first_name')} {row.recipientDoc.get('last_name')}
								</TableCell>
								<TableCell>{row.recipientDoc.get('om_uid')}</TableCell>
								<TableCell>
									{DateTime.fromMillis(row.paymentDoc.get('payment_at').seconds * 1000).toFormat('MM/yyyy')}
								</TableCell>
								<TableCell>
									<StringPropertyPreview
										property={buildProperty({
											dataType: 'string',
											enumValues: paymentStatusEnumValues,
										})}
										value={row.paymentDoc.get('status')}
										size="small"
									/>
								</TableCell>
								<TableCell align="right">
									<UpdatePaymentButton paymentDoc={row.paymentDoc} />
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
	);
}
