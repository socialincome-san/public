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
	ownIncomePage,
	plannedAchievementsPage,
	savingsPage,
	spendingPage,
	unexpectedExpensesCoveredPage,
	welcomePage,
} from './questions';

export const getQuestionnaire = (questionnaire: SurveyQuestionnaire, t: TFunction, name: string) => {
	switch (questionnaire) {
		case SurveyQuestionnaire.Onboarding:
			return onboardingQuestionnaire(t, name);
		case SurveyQuestionnaire.Checkin:
			return checkinQuestionnaire(t, name);
		case SurveyQuestionnaire.Offboarding:
			return []; // TODO create me
		case SurveyQuestionnaire.OffboardedCheckin:
			return []; // TODO create me
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
];

export const checkinQuestionnaire = (t: TFunction, name: string) => [
	welcomePage(t, name),
	maritalStatusPage(t),
	employmentStatusPage(t),
	livingLocationPage(t),
	dependentsPage(t),
	ownIncomePage(t),
	basicNeedsCoveragePage(t),
	expensesCoveredPage(t),
	unexpectedExpensesCoveredPage(t),
	educationAccessPage(t),
	savingsPage(t),
	deptPage(t),
	spendingPage(t),
	plannedAchievementsPage(t),
];
