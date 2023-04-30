import { Box, Button, Link, Popover, Typography } from '@mui/material';
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

	const updatePayment = (status: PaymentStatus) => auditedUpdateDoc(paymentDoc.ref, { status });

	return (
		<>
			{confirmed ? (
				<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0.5 }}>
					<Button color="error" onClick={() => updatePayment(PaymentStatus.Contested)} size="small" variant="outlined">
						Contested
					</Button>
					<Button
						color="success"
						onClick={() => updatePayment(PaymentStatus.Confirmed)}
						size="small"
						variant="outlined"
					>
						Confirmed
					</Button>
				</Box>
			) : (
				<Button
					variant="outlined"
					onClick={() => {
						setConfirmed(true);
						setTimeout(() => setConfirmed(false), 3000);
					}}
				>
					Update Status
				</Button>
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
						confirm: row.paymentDoc,
						date: DateTime.fromMillis(row.paymentDoc.get('payment_at').seconds * 1000).toFormat('MM/yyyy'),
						id: row.paymentDoc.ref.path,
						name: {
							name: `${row.recipientDoc.get('first_name')} ${row.recipientDoc.get('last_name')}`,
							tel: `+${row.recipientDoc.get('communication_mobile_phone.phone')}`,
						},
						omId: row.recipientDoc.get('om_uid'),
						status: row.paymentDoc.get('status'),
					}))}
				columns={[
					{
						field: 'name',
						flex: 1,
						headerName: 'Name',
						minWidth: 200,
						renderCell: (params) => {
							const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
							return (
								<div>
									<Popover
										anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
										open={Boolean(anchorEl)}
										anchorEl={anchorEl}
										onClose={() => setAnchorEl(null)}
									>
										<Link href={`tel:${params.value.tel}`}>
											<Typography sx={{ p: 2 }}>{params.value.tel}</Typography>
										</Link>
									</Popover>
									<div onClick={(event) => setAnchorEl(event.currentTarget)}>{params.value.name}</div>
								</div>
							);
						},
					},
					{ field: 'omId', flex: 1, headerName: 'OM ID', minWidth: 75 },
					{ field: 'date', flex: 1, headerName: 'Date', minWidth: 100 },
					{
						field: 'status',
						flex: 1,
						minWidth: 100,
						headerName: 'Status',
						renderCell: (params) => (
							<StringPropertyPreview
								property={{ dataType: 'string', enumValues: paymentStatusEnumValues }}
								size="small"
								value={params.value}
							/>
						),
					},
					{
						align: 'right',
						field: 'confirm',
						headerAlign: 'right',
						headerName: 'Confirm',
						minWidth: 220,
						renderCell: (params) => <UpdatePaymentButton paymentDoc={params.value} />,
						sortable: false,
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
