import { Box, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
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
		const unsubscribe = onSnapshot(
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
					} else {
						const paymentDoc = change.doc;
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
					}
				});
			}
		);
		return () => {
			unsubscribe();
		};
	}, []);

	const nameFilter = (row: PaymentConfirmationDocs) => {
		return `${row.recipientDoc.get('first_name')} ${row.recipientDoc.get('last_name')}`
			.toLowerCase()
			.includes(searchTerm.toLowerCase());
	};

	return (
		<Box sx={{ m: 2, display: 'grid', rowGap: 2 }}>
			<SearchBar onTextSearch={(text) => setSearchTerm(text)} />
			<DataGrid
				rows={Array.from(documents.values())
					.filter(nameFilter)
					.map((row) => ({
						id: row.paymentDoc.ref.path,
						name: `${row.recipientDoc.get('first_name')} ${row.recipientDoc.get('last_name')}`,
						omId: row.recipientDoc.get('om_uid'),
						date: DateTime.fromMillis(row.paymentDoc.get('payment_at').seconds * 1000).toFormat('MM/yyyy'),
						status: row.paymentDoc.get('status'),
						confirm: row.paymentDoc,
					}))}
				columns={[
					{ field: 'name', headerName: 'Name', flex: 1 },
					{ field: 'omId', headerName: 'OM ID', flex: 1 },
					{ field: 'date', headerName: 'Date', flex: 1 },
					{
						field: 'status',
						headerName: 'Status',
						flex: 1,
						renderCell: (params) => (
							<StringPropertyPreview
								property={{ dataType: 'string', enumValues: paymentStatusEnumValues }}
								value={params.value}
								size="small"
							/>
						),
					},
					{
						field: 'confirm',
						headerName: 'Confirm',
						flex: 1,
						align: 'right',
						headerAlign: 'right',
						sortable: false,
						renderCell: (params) => <UpdatePaymentButton paymentDoc={params.value} />,
					},
				]}
				initialState={{
					pagination: {
						paginationModel: {
							pageSize: 100,
						},
					},
				}}
				pageSizeOptions={[10, 50, 100]}
				disableRowSelectionOnClick
			/>
		</Box>
	);
}
