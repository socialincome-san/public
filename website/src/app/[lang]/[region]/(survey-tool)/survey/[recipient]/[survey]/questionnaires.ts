import { SurveyQuestionnaire } from '@socialincome/shared/src/types/survey';
import { TranslateFunction } from '@socialincome/shared/src/utils/i18n';
import {
	achievementsAchievedPage,
	debtHouseholdPage,
	debtPersonalPage,
	dependentsPage,
	disabilityPage,
	employmentStatusPage,
	happierPage,
	impactFinancialPage,
	impactLifePage,
	livingLocationPage,
	longEnoughPage,
	maritalStatusPage,
	otherSupportPage,
	plannedAchievementsPage,
	plannedAchievementsRemainingPage,
	savingsPage,
	schoolAttendancePage,
	skippingMealsPage,
	spendingPage,
	unexpectedExpensesCoveredPage,
	welcomePage,
} from './questions';

export const getQuestionnaire = (questionnaire: SurveyQuestionnaire, t: TranslateFunction, name: string) => {
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

export const onboardingQuestionnaire = (t: TranslateFunction, name: string) => [
	welcomePage(t, name),
	plannedAchievementsPage(t),
	livingLocationPage(t),
	maritalStatusPage(t),
	dependentsPage(t),
	schoolAttendancePage,
	employmentStatusPage(t),
	disabilityPage(t),
	skippingMealsPage,
	unexpectedExpensesCoveredPage(t),
	savingsPage(t),
	debtPersonalPage(t),
	debtHouseholdPage(t),
	otherSupportPage(t),
];

export const checkinQuestionnaire = (t: TranslateFunction, name: string) => [
	welcomePage(t, name),
	spendingPage(t),
	plannedAchievementsRemainingPage(t),
	livingLocationPage(t),
	maritalStatusPage(t),
	dependentsPage(t),
	schoolAttendancePage,
	employmentStatusPage(t),
	disabilityPage(t),
	skippingMealsPage,
	unexpectedExpensesCoveredPage(t),
	savingsPage(t),
	debtPersonalPage(t),
	debtHouseholdPage(t),
	otherSupportPage(t),
];

export const offboardingQuestionnaire = (t: TranslateFunction, name: string) => [
	welcomePage(t, name),
	impactFinancialPage(t),
	impactLifePage(t),
	achievementsAchievedPage(t),
	happierPage(t),
	longEnoughPage(t),
	livingLocationPage(t),
	maritalStatusPage(t),
	dependentsPage(t),
	schoolAttendancePage,
	employmentStatusPage(t),
	disabilityPage(t),
	skippingMealsPage,
	unexpectedExpensesCoveredPage(t),
	savingsPage(t),
];

export const offboardingCheckinQuestionnaire = (t: TranslateFunction, name: string) => [
	welcomePage(t, name),
	impactFinancialPage(t),
	longEnoughPage(t),
	livingLocationPage(t),
	maritalStatusPage(t),
	dependentsPage(t),
	schoolAttendancePage,
	employmentStatusPage(t),
	disabilityPage(t),
	skippingMealsPage,
	unexpectedExpensesCoveredPage(t),
	savingsPage(t),
];
