import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import SurveyLayout from '../../../components/survey/SurveyLayout';
// @ts-ignore

export default function Survey(props: SurveyProps) {
	return <SurveyLayout>{<SurveyWrapperComponent {...props} />}</SurveyLayout>;
}

// makes this component rendering only on the client as if it would be a normal react app.
// this is required since survey.js doesn't render properly on the server due to some window dependencies.
const SurveyWrapperComponent = dynamic(() => import('../../../components/survey/SurveyAuth'), {
	ssr: false,
});

export const getServerSideProps: GetServerSideProps = async (context) => {
	return {
		props: {
			recipientId: context.params?.recipient,
			surveyId: context.params?.survey,
			accessEmail: context.query['email'] || null,
			accessPw: context.query['pw'] || null,
			...(await serverSideTranslations(context.locale!, ['website-survey'], null, ['en', 'krio'])),
		},
	};
};
