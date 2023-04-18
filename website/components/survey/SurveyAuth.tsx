import { Alert, CircularProgress, Typography } from '@mui/material';
import { signInWithEmailAndPassword, User } from 'firebase/auth';

import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import { getFirebaseClients } from '../../utils/firebase';
import SurveyLoader from './SurveyLoader';

export default function SurveyAuth(props: SurveyProps) {
	const { t } = useTranslation('website-survey');
	const [user, setUser] = useState<User | null>(null);
	const { auth } = getFirebaseClients();
	useEffect(() => {
		auth.onAuthStateChanged((user) => {
			setUser(user);
		});
	}, [auth]);

	const { isError } = useQuery(
		[props],
		async () => {
			if (props.accessEmail && props.accessPw && auth?.currentUser?.email != props.accessEmail) {
				console.log('Signing in');
				return signInWithEmailAndPassword(auth, props.accessEmail!, props.accessPw!);
			} else {
				return Promise.resolve();
			}
		},
		{
			refetchOnWindowFocus: false,
			staleTime: 1000 * 60 * 60, // don't update for an 1 hour
		}
	);

	if (user?.email == props.accessEmail) {
		return <SurveyLoader recipientId={props.recipientId} surveyId={props.surveyId} />;
	} else {
		if (isError) {
			return <Alert severity="error">{t('survey.common.authError')}</Alert>;
		}
		if (!props.accessEmail || !props.accessPw) {
			return <Alert severity="error">{t('survey.common.missingCredentials')}</Alert>;
		}
		return (
			<Typography align={'center'}>
				<CircularProgress />
			</Typography>
		);
	}
}

export interface SurveyProps {
	recipientId: string;
	surveyId: string;
	accessEmail: string | null;
	accessPw: string | null;
}
