import { GetStaticProps } from 'next';
import { TFunction } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import {
	basicNeedsCoveragePage,
	dependentsPage,
	deptPage,
	educationAccessPage,
	employmentStatusPage,
	expensesCoveredPage,
	livingLocationPage,
	maritalStatusPage,
	noHelpPage,
	plannedAchievementsPage,
	savingsPage,
	unexpectedExpensesCoveredPage,
	welcomePage,
} from '../../components/survey/questions';

/**
 * Survey for onboarding new recipients
 */
export const SurveyOnboarding = () => {
	const pages = (t: TFunction, name: string) => [
		welcomePage(t, name),
		maritalStatusPage(t),
		employmentStatusPage(t),
		livingLocationPage(t),
		dependentsPage(t),
		basicNeedsCoveragePage(t),
		expensesCoveredPage(t),
		unexpectedExpensesCoveredPage(t),
		educationAccessPage(t),
		savingsPage(t),
		deptPage(t),
		plannedAchievementsPage(t),
		noHelpPage(t),
	];

	return <SurveyComponent pages={pages} />;
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
const SurveyComponent = dynamic(() => import('../../components/survey/Survey'), {
	ssr: false,
});

export default SurveyOnboarding;
