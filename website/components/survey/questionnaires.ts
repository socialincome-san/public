import { TFunction } from 'next-i18next';
import { SurveyQuestionnaire } from '../../../shared/src/types/admin/Survey';
import {
	achievementsAchievedPage,
	basicNeedsCoveragePage,
	dependentsPage,
	deptPage,
	disabilityPage,
	educationAccessPage,
	employmentStatusPage,
	expensesCoveredPage,
	financialSituationPage,
	happierPage,
	livingLocationPage,
	longEnoughPage,
	maritalStatusPage,
	moreFinanciallySecurePage,
	ownIncomePage,
	plannedAchievementsPage,
	savingsPage,
	selfSustainablePage,
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
			return offboardingQuestionnaire(t, name);
		case SurveyQuestionnaire.OffboardedCheckin:
			return offboardingCheckinQuestionnaire(t, name);
	}
	return [];
};

export const onboardingQuestionnaire = (t: TFunction, name: string) => [
	welcomePage(t, name),
	financialSituationPage(t),
	maritalStatusPage(t),
	dependentsPage(t),
	employmentStatusPage(t),
	disabilityPage(t),
	livingLocationPage(t),
	basicNeedsCoveragePage(t),
	expensesCoveredPage(t),
	unexpectedExpensesCoveredPage(t),
	educationAccessPage(t),
	savingsPage(t),
	deptPage(t),
	plannedAchievementsPage(t, true),
];

export const checkinQuestionnaire = (t: TFunction, name: string) => [
	welcomePage(t, name),
	financialSituationPage(t),
	maritalStatusPage(t),
	dependentsPage(t),
	employmentStatusPage(t),
	disabilityPage(t),
	livingLocationPage(t),
	spendingPage(t),
	ownIncomePage(t),
	plannedAchievementsPage(t, false),
	basicNeedsCoveragePage(t),
	expensesCoveredPage(t),
	unexpectedExpensesCoveredPage(t),
	educationAccessPage(t),
	savingsPage(t),
	deptPage(t),
];

export const offboardingQuestionnaire = (t: TFunction, name: string) => [
	welcomePage(t, name),
	financialSituationPage(t),
	achievementsAchievedPage(t),
	moreFinanciallySecurePage(t),
	happierPage(t),
	longEnoughPage(t),
	selfSustainablePage(t),
	maritalStatusPage(t),
	dependentsPage(t),
	employmentStatusPage(t),
	disabilityPage(t),
	livingLocationPage(t),
	spendingPage(t),
	basicNeedsCoveragePage(t),
	expensesCoveredPage(t),
	unexpectedExpensesCoveredPage(t),
	educationAccessPage(t),
	savingsPage(t),
	deptPage(t),
];

export const offboardingCheckinQuestionnaire = (t: TFunction, name: string) => [
	welcomePage(t, name),
	financialSituationPage(t),
	maritalStatusPage(t),
	dependentsPage(t),
	employmentStatusPage(t),
	disabilityPage(t),
	livingLocationPage(t),
	spendingPage(t),
	basicNeedsCoveragePage(t),
	expensesCoveredPage(t),
	unexpectedExpensesCoveredPage(t),
	educationAccessPage(t),
	savingsPage(t),
	deptPage(t),
];
