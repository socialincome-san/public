import SearchIcon from '@mui/icons-material/Search';
import { Alert, Box, Button, Card, CardContent, TextField } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { httpsCallable } from 'firebase/functions';
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { SurveyCredentialResponse } from '../../../shared/src/types';
import SurveyLayout from '../../components/survey/SurveyLayout';
import { getFirebaseClients } from '../../utils/firebase';

export default function SurveyLogin() {
	const { t } = useTranslation('website-survey');
	const [phoneNumber, setPhoneNumber] = useState('');
	const [accessKey, setAccessKey] = useState('');
	const searchEnabled = phoneNumber != '' && accessKey != '';
	const router = useRouter();

	const { functions } = getFirebaseClients();
	const getSurveyCredentials = httpsCallable(functions, 'getSurveyCredentials');

	const {
		data,
		refetch: searchSurvey,
		isFetching,
		isError,
	} = useQuery(
		[phoneNumber, accessKey],
		async () => {
			const result = await getSurveyCredentials({
				phoneNumber: phoneNumber,
				accessToken: accessKey,
			});
			return result.data as SurveyCredentialResponse;
		},
		{
			refetchOnWindowFocus: false,
			enabled: false,
		}
	);
	useEffect(() => {
		if (data) {
			const getParams = {
				email: data.email,
				pw: data.pw,
			};
			const url = `/survey/${data.recipientId}/${data.surveyId}?${new URLSearchParams(getParams).toString()}`;
			console.log(url);
			router.push(url);
		}
	}, [data]);

	return (
		<SurveyLayout>
			<Box
				component="form"
				sx={{
					margin: '16px',
					'& .MuiTextField-root': { marginBottom: 2 },
				}}
				noValidate
				autoComplete="off"
			>
				<Card variant="outlined">
					<CardContent>
						<Box sx={{ marginBottom: 3 }}>{t('survey.login.message')}</Box>
						<TextField
							fullWidth
							required
							value={phoneNumber}
							label={t('survey.login.phoneNumber')}
							onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
								setPhoneNumber(event.target.value);
							}}
						/>
						<TextField
							fullWidth
							required
							value={accessKey}
							label={t('survey.login.accessCode')}
							onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
								setAccessKey(event.target.value);
							}}
						/>
						<Button
							fullWidth
							size="large"
							variant="contained"
							endIcon={!isFetching && <SearchIcon />}
							disabled={!searchEnabled}
							onClick={() => searchSurvey()}
						>
							{isFetching ? t('survey.login.loading') : t('survey.login.loadSurvey')}
						</Button>
						{isError && (
							<Alert sx={{ marginTop: 2 }} severity="error">
								{t('survey.login.error')}
							</Alert>
						)}
					</CardContent>
				</Card>
			</Box>
		</SurveyLayout>
	);
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	return {
		props: {
			...(await serverSideTranslations(context.locale!, ['website-survey'], null, ['en', 'krio'])),
		},
	};
};
