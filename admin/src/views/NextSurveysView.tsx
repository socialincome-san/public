import { Box, Button, Link, Popover, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Recipient } from '@socialincome/shared/src/types/recipient';
import { getSurveyUrl, Survey, SurveyStatus } from '@socialincome/shared/src/types/survey';
import { toDate, toDateTime } from '@socialincome/shared/src/utils/date';
import {
	and,
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
import { surveyQuestionnaireProperty, surveyStatusProperty } from '../collections/surveys/SurveysProperties';
import { NoRowsOverlay } from '../components/Overlays';

type RecipientSurveyDocs = {
	surveyDoc: QueryDocumentSnapshot<Survey>;
	recipientDoc: QueryDocumentSnapshot<Recipient>;
};

export function NextSurveysView() {
	const db = getFirestore();
	const [documents, setDocuments] = useState<Map<string, RecipientSurveyDocs>>(new Map());

	useEffect(() => {
		const unsubscribe = onSnapshot(
			query(
				collectionGroup(db, 'surveys'),
				and(
					or(
						where('status', '==', SurveyStatus.New),
						where('status', '==', SurveyStatus.Sent),
						where('status', '==', SurveyStatus.Scheduled),
						where('status', '==', SurveyStatus.InProgress),
					),
					where('due_date_at', '<=', toDate(DateTime.now().plus({ days: 14 }))),
				),
				orderBy('due_date_at', 'desc'),
			),
			async (result) => {
				result.docChanges().forEach((change) => {
					if (change.type === 'removed') {
						setDocuments((prev) => {
							prev.delete(change.doc.ref.path);
							return new Map(prev);
						});
					} else {
						const surveyDoc = change.doc;
						if (surveyDoc.ref.parent.parent) {
							getDoc(surveyDoc.ref.parent.parent).then((recipientDoc) => {
								setDocuments(
									(prev) =>
										new Map(
											prev.set(surveyDoc.ref.path, {
												surveyDoc: surveyDoc as QueryDocumentSnapshot<Survey>,
												recipientDoc: recipientDoc as QueryDocumentSnapshot<Recipient>,
											}),
										),
								);
							});
						}
					}
				});
			},
		);
		return () => {
			unsubscribe();
		};
	}, []);

	return (
		<Box sx={{ m: 2, display: 'grid', rowGap: 2 }}>
			<DataGrid
				autoHeight
				rows={Array.from(documents.values()).map((row) => ({
					date: toDateTime(row.surveyDoc.get('due_date_at')).toFormat('MM/yyyy'),
					id: row.surveyDoc.ref.path,
					name: {
						name: `${row.recipientDoc.get('first_name')} ${row.recipientDoc.get('last_name')}`,
						tel: `+${row.recipientDoc.get('communication_mobile_phone.phone')}`,
					},
					questionnaire: row.surveyDoc.get('questionnaire'),
					omId: row.recipientDoc.get('om_uid'),
					status: row.surveyDoc.get('status'),
					url: getSurveyUrl(
						import.meta.env.VITE_WEBSITE_BASE_URL,
						row.surveyDoc.data(),
						row.surveyDoc.id,
						row.recipientDoc.id,
					),
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
					{ field: 'omId', flex: 1, headerName: 'OM ID', minWidth: 50 },
					{
						field: 'questionnaire',
						flex: 1,
						headerName: 'Questionnaire',
						minWidth: 50,
						renderCell: (params) => (
							<StringPropertyPreview property={surveyQuestionnaireProperty} size="small" value={params.value} />
						),
					},
					{ field: 'date', flex: 1, headerName: 'Date', minWidth: 75 },
					{
						field: 'status',
						flex: 1,
						minWidth: 75,
						headerName: 'Status',
						renderCell: (params) => (
							<StringPropertyPreview property={surveyStatusProperty} size="small" value={params.value} />
						),
					},
					{
						field: 'url',
						flex: 1,
						minWidth: 75,
						headerName: 'Open',
						renderCell: (params) => (
							<Button variant="outlined" target="_blank" href={params.value}>
								Open
							</Button>
						),
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
				slots={{ noRowsOverlay: NoRowsOverlay }}
			/>
		</Box>
	);
}
