import { SurveyQuestionnaire } from '@/generated/prisma/enums';
import { type Messages } from '@/lib/i18n/messages';
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
	type SurveyTranslator,
} from './questions';

export const getQuestionnaire = (
	questionnaire: SurveyQuestionnaire,
	t: SurveyTranslator,
	messages: Messages,
	name: string,
) => {
	switch (questionnaire) {
		case SurveyQuestionnaire.onboarding:
			return onboardingQuestionnaire(t, messages, name);
		case SurveyQuestionnaire.checkin:
			return checkinQuestionnaire(t, messages, name);
		case SurveyQuestionnaire.offboarding:
			return offboardingQuestionnaire(t, messages, name);
		case SurveyQuestionnaire.offboarded_checkin:
			return offboardingCheckinQuestionnaire(t, messages, name);
	}

	return [];
};

const onboardingQuestionnaire = (t: SurveyTranslator, messages: Messages, name: string) => [
	welcomePage(t, name),
	plannedAchievementsPage(t, messages),
	livingLocationPage(t, messages),
	maritalStatusPage(t, messages),
	dependentsPage(t, messages),
	schoolAttendancePage(t, messages),
	employmentStatusPage(t, messages),
	disabilityPage(t, messages),
	skippingMealsPage(t, messages),
	unexpectedExpensesCoveredPage(t, messages),
	savingsPage(t, messages),
	debtPersonalPage(t, messages),
	debtHouseholdPage(t, messages),
	otherSupportPage(t, messages),
];

const checkinQuestionnaire = (t: SurveyTranslator, messages: Messages, name: string) => [
	welcomePage(t, name),
	spendingPage(t, messages),
	plannedAchievementsRemainingPage(t, messages),
	livingLocationPage(t, messages),
	maritalStatusPage(t, messages),
	dependentsPage(t, messages),
	schoolAttendancePage(t, messages),
	employmentStatusPage(t, messages),
	disabilityPage(t, messages),
	skippingMealsPage(t, messages),
	unexpectedExpensesCoveredPage(t, messages),
	savingsPage(t, messages),
	debtPersonalPage(t, messages),
	debtHouseholdPage(t, messages),
	otherSupportPage(t, messages),
];

const offboardingQuestionnaire = (t: SurveyTranslator, messages: Messages, name: string) => [
	welcomePage(t, name),
	impactFinancialPage(t, messages),
	impactLifePage(t, messages),
	achievementsAchievedPage(t, messages),
	happierPage(t, messages),
	longEnoughPage(t, messages),
	livingLocationPage(t, messages),
	maritalStatusPage(t, messages),
	dependentsPage(t, messages),
	schoolAttendancePage(t, messages),
	employmentStatusPage(t, messages),
	disabilityPage(t, messages),
	skippingMealsPage(t, messages),
	unexpectedExpensesCoveredPage(t, messages),
	savingsPage(t, messages),
];

const offboardingCheckinQuestionnaire = (t: SurveyTranslator, messages: Messages, name: string) => [
	welcomePage(t, name),
	impactFinancialPage(t, messages),
	longEnoughPage(t, messages),
	livingLocationPage(t, messages),
	maritalStatusPage(t, messages),
	dependentsPage(t, messages),
	schoolAttendancePage(t, messages),
	employmentStatusPage(t, messages),
	disabilityPage(t, messages),
	skippingMealsPage(t, messages),
	unexpectedExpensesCoveredPage(t, messages),
	savingsPage(t, messages),
];
