import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';

/**
 * Survey for onboarding new recipients
 */
export const SurveyOnboarding = () => {
	return <SurveyComponent />;
};
export const getStaticProps: GetStaticProps = async ({ locale }) => {
	return {
		props: {
			...(await serverSideTranslations(locale!, ['website-survey'], null, ['en', 'krio'])),
		},
	};
};

// makes this component rendering only on the client as if it would be a normal react app.
// this is required survey.js doesn't render properly on the server due to some window dependencies.
// @ts-ignore
const SurveyComponent = dynamic(() => import('../components/survey/Survey'), {
	ssr: false,
});

export default SurveyOnboarding;
