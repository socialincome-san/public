import { TFunction } from 'next-i18next';
import { SurveyQuestionnaire } from '../../../shared/src/types/admin/Survey';
import {
	welcomePage,
	livingLocationPage,
	maritalStatusPage,
	dependentsPage,
	schoolAttendancePage,
	employmentStatusPage,
	disabilityPage,
	skippingMealsPage,
	unexpectedExpensesCoveredPage,
	savingsPage,
	debtPersonalPage,
	debtHouseholdPage,
	otherSupportPage,
	plannedAchievementsPage,
	spendingPage,
	impactFinancialPage,
	impactLifePage,
	impactFinancialIndependenceOverTimePage,
	longEnoughPage,
	achievementsAchievedPage,
	happierPage,
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
	maritalStatusPage(t),
	dependentsPage(t),
	schoolAttendancePage,
	skippingMealsPage,
	employmentStatusPage(t),
	disabilityPage(t),
	livingLocationPage(t),
	unexpectedExpensesCoveredPage(t),
	savingsPage(t),
	debtPersonalPage(t),
	debtHouseholdPage(t),
	otherSupportPage(t),
	plannedAchievementsPage(t, true),
	// xxx dont get this isOnboarding ture
];

export const checkinQuestionnaire = (t: TFunction, name: string) => [
	welcomePage(t, name),
	maritalStatusPage(t),
	dependentsPage(t),
	employmentStatusPage(t),
	disabilityPage(t),
	livingLocationPage(t),
	spendingPage(t),
	plannedAchievementsPage(t, false),
	unexpectedExpensesCoveredPage(t),
	savingsPage(t),
];

export const offboardingQuestionnaire = (t: TFunction, name: string) => [
	welcomePage(t, name),
	achievementsAchievedPage(t),
	happierPage(t),
	longEnoughPage(t),
	maritalStatusPage(t),
	dependentsPage(t),
	employmentStatusPage(t),
	disabilityPage(t),
	livingLocationPage(t),
	spendingPage(t),
	unexpectedExpensesCoveredPage(t),
	savingsPage(t),
	impactFinancialPage(t),
	impactLifePage(t),
	impactFinancialIndependenceOverTimePage(t),
];

export const offboardingCheckinQuestionnaire = (t: TFunction, name: string) => [
	welcomePage(t, name),
	maritalStatusPage(t),
	dependentsPage(t),
	employmentStatusPage(t),
	disabilityPage(t),
	livingLocationPage(t),
	spendingPage(t),
	unexpectedExpensesCoveredPage(t),
	savingsPage(t),
];
