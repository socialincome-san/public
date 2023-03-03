import { TFunction } from 'next-i18next';
import { SurveyQuestionnaire } from '../../../shared/src/types/admin/Survey';
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
} from './questions';

export const getQuestionnaire = (questionnaire: SurveyQuestionnaire, t: TFunction, name: string) => {
	switch (questionnaire) {
		case SurveyQuestionnaire.Onboarding:
			return onboardingQuestionnaire(t, name);
	}
	return [];
};

export const onboardingQuestionnaire = (t: TFunction, name: string) => [
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
