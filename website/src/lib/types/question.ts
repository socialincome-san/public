export interface Question {
  type: QuestionInputType;
  name: string;
  choices: unknown[];
  choicesTranslationKey?: string;
  translationKey: string;
  descriptionTranslationKey?: string;
}

enum QuestionInputType {
  RADIO_GROUP = 'radiogroup',
  COMMENT = 'comment',
  CHECKBOX = 'checkbox',
  RANKING = 'ranking',
}

export const MARITAL_STATUS: Question = {
  type: QuestionInputType.RADIO_GROUP,
  name: 'maritalStatusV1',
  choices: ['married', 'widowed', 'divorced', 'separated', 'neverMarried'],
  choicesTranslationKey: 'survey.questions.maritalStatusChoices',
  translationKey: 'survey.questions.maritalStatusTitleV1',
};

export const LIVING_LOCATION: Question = {
  type: QuestionInputType.RADIO_GROUP,
  name: 'livingLocationV1',
  choices: [
    'westernAreaUrbanFreetown',
    'westernAreaRural',
    'easternProvince',
    'northernProvince',
    'southernProvince',
    'northWestProvince',
  ],
  translationKey: 'survey.questions.livingLocationTitleV1',
  descriptionTranslationKey: 'survey.questions.livingLocationDescV1',
  choicesTranslationKey: 'survey.questions.livingLocationChoices',
};

const BOOLEAN_CHOICES = { choices: [true, false], choicesTranslationKey: 'survey.questions.yesNoChoices' };

export const HAS_DEPENDENTS: Question = {
  type: QuestionInputType.RADIO_GROUP,
  name: 'hasDependentsV1',
  ...BOOLEAN_CHOICES,
  translationKey: 'survey.questions.hasDependentsTitleV1',
  descriptionTranslationKey: 'survey.questions.hasDependentsDescV1',
};

export const NOT_EMPLOYED: Question = {
  type: QuestionInputType.RADIO_GROUP,
  name: 'notEmployedV1',
  ...BOOLEAN_CHOICES,
  translationKey: 'survey.questions.notEmployedTitleV1',
};

export const NUMBER_OF_DEPENDENTS: Question = {
  type: QuestionInputType.RADIO_GROUP,
  name: 'nrDependentsV1',
  choices: ['1-2', '3-4', '5-7', '8-10', '10-'],
  translationKey: 'survey.questions.nrDependentsTitleV1',
  choicesTranslationKey: 'survey.questions.nrDependentsChoices',
};

export const SCHOOL_ATTENDANCE: Question = {
  type: QuestionInputType.RADIO_GROUP,
  name: 'schoolAttendanceV1',
  ...BOOLEAN_CHOICES,
  translationKey: 'survey.questions.attendingSchoolV1',
};

export const EMPLOYMENT_STATUS: Question = {
  type: QuestionInputType.RADIO_GROUP,
  name: 'employmentStatusV1',
  choices: ['employed', 'selfEmployed', 'notEmployed', 'retired'],
  translationKey: 'survey.questions.employmentStatusTitleV1',
  choicesTranslationKey: 'survey.questions.employmentStatusChoices',
};
export const DISABILITY: Question = {
  type: QuestionInputType.RADIO_GROUP,
  name: 'disabilityV1',
  ...BOOLEAN_CHOICES,
  translationKey: 'survey.questions.disabilityTitleV1',
};

export const SKIPPING_MEALS: Question = {
  type: QuestionInputType.RADIO_GROUP,
  name: 'skippingMealsV1',
  ...BOOLEAN_CHOICES,
  translationKey: 'survey.questions.skippingMealsTitleV1',
};

export const SKIPPING_MEALS_LAST_WEEK: Question = {
  type: QuestionInputType.RADIO_GROUP,
  name: 'skippingMealsLastWeekV1',
  ...BOOLEAN_CHOICES,
  translationKey: 'survey.questions.skippingMealsLastWeekTitleV1',
};

export const SKIPPING_MEALS_LAST_WEEK_3_MEALS: Question = {
  type: QuestionInputType.RADIO_GROUP,
  name: 'skippingMealsLastWeek3MealsV1',
  ...BOOLEAN_CHOICES,
  translationKey: 'survey.questions.skippingMealsLastWeek3MealsTitleV1',
};

export const UNEXPECTED_EXPENSES_COVERED: Question = {
  type: QuestionInputType.RADIO_GROUP,
  name: 'unexpectedExpensesCoveredV1',
  ...BOOLEAN_CHOICES,
  translationKey: 'survey.questions.unexpectedExpensesCoveredTitleV1',
};
export const SAVINGS: Question = {
  type: QuestionInputType.RADIO_GROUP,
  name: 'savingsV1',
  ...BOOLEAN_CHOICES,
  translationKey: 'survey.questions.savingsTitleV1',
};

export const DEBT_PERSONAL: Question = {
  type: QuestionInputType.RADIO_GROUP,
  name: 'debtPersonalV1',
  ...BOOLEAN_CHOICES,
  translationKey: 'survey.questions.debtPersonalTitleV1',
};

export const DEBT_PERSONAL_REPAY: Question = {
  type: QuestionInputType.RADIO_GROUP,
  name: 'debtPersonalRepayV1',
  ...BOOLEAN_CHOICES,
  translationKey: 'survey.questions.debtPersonalRepayTitleV1',
};

export const DEBT_HOUSEHOLD: Question = {
  type: QuestionInputType.RADIO_GROUP,
  name: 'debtHouseholdV1',
  ...BOOLEAN_CHOICES,
  translationKey: 'survey.questions.debtHouseholdTitleV1',
};
export const DEBT_HOUSEHOLD_WHO_REPAYS: Question = {
  type: QuestionInputType.RADIO_GROUP,
  name: 'debtHouseholdWhoRepaysV1',
  ...BOOLEAN_CHOICES,
  translationKey: 'survey.questions.debtHouseholdWhoRepaysTitleV1',
};
export const OTHER_SUPPORT: Question = {
  type: QuestionInputType.RADIO_GROUP,
  name: 'otherSupportV1',
  ...BOOLEAN_CHOICES,
  translationKey: 'survey.questions.otherSupportTitleV1',
};

export const PLANNED_ACHIEVEMENT: Question = {
  type: QuestionInputType.COMMENT,
  name: 'plannedAchievementV1',
  translationKey: 'survey.questions.plannedAchievementTitleV1',
  choices: [],
};

export const SPENDING: Question = {
  type: QuestionInputType.CHECKBOX,
  name: 'spendingV1',
  choices: ['education', 'food', 'housing', 'healthCare', 'mobility', 'saving', 'investment'],
  translationKey: 'survey.questions.spendingTitleV1',
  descriptionTranslationKey: 'survey.questions.spendingDescV1',
  choicesTranslationKey: 'survey.questions.spendingChoices',
};

export const PLANNED_ACHIEVEMENT_REMAINING: Question = {
  type: QuestionInputType.COMMENT,
  name: 'plannedAchievementRemainingV1',
  translationKey: 'survey.questions.plannedAchievementRemainingTitleV1',
  choices: [],
};

export const IMPACT_FINANCIAL_INDEPENDENCE: Question = {
  type: QuestionInputType.RADIO_GROUP,
  name: 'impactFinancialIndependenceV1',
  ...BOOLEAN_CHOICES,
  translationKey: 'survey.questions.financialIndependenceTitleV1',
};

export const IMPACT_LIFE_GENERAL: Question = {
  type: QuestionInputType.COMMENT,
  name: 'impactLifeGeneralV1',
  translationKey: 'survey.questions.impactLifeGeneralTitleV1',
  choices: [],
};

export const ACHIEVEMENTS_ACHIEVED: Question = {
  type: QuestionInputType.RADIO_GROUP,
  name: 'achievementsAchievedV1',
  ...BOOLEAN_CHOICES,
  translationKey: 'survey.questions.achievementsAchievedTitleV1',
};

export const ACHIEVEMENTS_NOT_ACHIEVED: Question = {
  type: QuestionInputType.COMMENT,
  name: 'achievementsNotAchievedCommentV1',
  choices: [],
  translationKey: 'survey.questions.achievementsNotAchievedCommentTitleV1',
};

export const HAPPIER: Question = {
  type: QuestionInputType.RADIO_GROUP,
  name: 'happierV1',
  ...BOOLEAN_CHOICES,
  translationKey: 'survey.questions.happierTitleV1',
};

export const HAPPIER_COMMENT: Question = {
  type: QuestionInputType.COMMENT,
  name: 'happierCommentV1',
  translationKey: 'survey.questions.happierCommentTitleV1',
  choices: [],
};
export const NOT_HAPPIER_COMMENT: Question = {
  type: QuestionInputType.COMMENT,
  translationKey: 'survey.questions.notHappierCommentTitleV1',
  name: 'notHappierCommentV1',
  choices: [],
};

export const LONG_ENOUGH: Question = {
  type: QuestionInputType.RADIO_GROUP,
  name: 'longEnough',
  translationKey: 'survey.questions.longEnoughTitleV1',
  ...BOOLEAN_CHOICES,
};

export const RANKING: Question = {
  type: QuestionInputType.RANKING,
  name: 'spendingRankedV1',
  choices: [],
  translationKey: 'survey.questions.spendingRankingTitleV1',
  descriptionTranslationKey: 'survey.questions.spendingRankingDescV1',
};
