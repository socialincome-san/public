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
	plannedAchievementsRemainingPage,
	spendingPage,
	impactFinancialPage,
	impactLifePage,
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

export const checkinQuestionnaire = (t: TFunction, name: string) => [
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

export const offboardingQuestionnaire = (t: TFunction, name: string) => [
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

export const offboardingCheckinQuestionnaire = (t: TFunction, name: string) => [
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
