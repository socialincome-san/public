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
import { StringPropertyPreview } from 'firecms';
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

type PaymentConfirmationDocs = {
	paymentDoc: QueryDocumentSnapshot<Payment>;
	recipientDoc: QueryDocumentSnapshot<Recipient>;
};

export function PaymentsConfirmationView() {
	const db = getFirestore();
	const [documents, setDocuments] = useState<Map<string, PaymentConfirmationDocs>>(new Map());
	const [searchTerm, setSearchTerm] = useState<string>('');

	useEffect(() => {
		onSnapshot(
			query(
				collectionGroup(db, 'payments'),
				or(where('status', '==', PaymentStatus.Paid), where('status', '==', PaymentStatus.Contested)),
				orderBy('payment_at', 'desc')
			),
			async (result) => {
				result.docChanges().forEach((change) => {
					if (change.type === 'removed') {
						setDocuments((prev) => {
							prev.delete(change.doc.ref.path);
							return new Map(prev);
						});
					}
				});
				result.forEach((paymentDoc) => {
					if (paymentDoc.ref.parent.parent) {
						getDoc(paymentDoc.ref.parent.parent).then((recipientDoc) => {
							setDocuments(
								(prev) =>
									new Map(
										prev.set(paymentDoc.ref.path, {
											paymentDoc: paymentDoc as QueryDocumentSnapshot<Payment>,
											recipientDoc: recipientDoc as QueryDocumentSnapshot<Recipient>,
										})
									)
							);
						});
					}
				});
			}
		);
	}, []);

	const nameFilter = (row: PaymentConfirmationDocs) => {
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
							<TableCell />
						</TableRow>
					</TableHead>
					<TableBody>
						{Array.from(documents.values())
							.filter(nameFilter)
							.map((row) => (
								<TableRow key={row.paymentDoc.ref.path} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
									<TableCell component="th" scope="row">
										{row.recipientDoc.get('first_name')} {row.recipientDoc.get('last_name')}
									</TableCell>
									<TableCell>{row.recipientDoc.get('om_uid')}</TableCell>
									<TableCell>
										{DateTime.fromMillis(row.paymentDoc.get('payment_at').seconds * 1000).toFormat('MM/yyyy')}
									</TableCell>
									<TableCell>
										<StringPropertyPreview
											property={{ dataType: 'string', enumValues: paymentStatusEnumValues }}
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
