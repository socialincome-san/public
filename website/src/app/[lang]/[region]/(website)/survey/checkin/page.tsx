import { Translator } from '@socialincome/shared/src/utils/i18n';
import {
  BaseContainer,
  Typography
} from "@socialincome/ui";
import { DefaultPageProps } from "@/app/[lang]/[region]";
import { getMetadata } from "@/metadata";

export async function generateMetadata({ params }: DefaultPageProps) {
  return getMetadata(params.lang, 'website-survey');
}

export default async function Page({ params: { lang } }: DefaultPageProps) {
  const translator = await Translator.getInstance({
    language: lang,
    namespaces: ['website-survey'],
  });

  return (
    <BaseContainer className="mx-auto flex max-w-2xl flex-col pt-8 pb-16 space-y-10">
      <Typography size="5xl" weight="bold">
        {translator.t('titleCheckin')}
      </Typography>

      <div className="space-y-4">
        <Typography size="2xl" weight="bold">
          {translator.t("survey.questions.spendingTitleV1")}
        </Typography>
        <select
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="" disabled selected>{translator.t("select")}</option>
          <option value="">{translator.t("survey.questions.spendingChoices.education")}</option>
          <option value="">{translator.t("survey.questions.spendingChoices.food")}</option>
          <option value="">{translator.t("survey.questions.spendingChoices.housing")}</option>
          <option value="">{translator.t("survey.questions.spendingChoices.healthCare")}</option>
          <option value="">{translator.t("survey.questions.spendingChoices.mobility")}</option>
          <option value="">{translator.t("survey.questions.spendingChoices.saving")}</option>
          <option value="">{translator.t("survey.questions.spendingChoices.investment")}</option>
        </select>
      </div>

      <div className="space-y-4">
        <Typography size="2xl" weight="bold">
          {translator.t("survey.questions.plannedAchievementRemainingTitleV1")}
        </Typography>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded"
          placeholder={translator.t("freetext")}
        />
      </div>

      <div className="space-y-4">
        <Typography size="2xl" weight="bold">
          {translator.t("survey.questions.livingLocationTitleV1")}
        </Typography>
        <select
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="" disabled selected>{translator.t("select")}</option>
          <option value="">{translator.t("survey.questions.livingLocationChoices.westernAreaUrbanFreetown")}</option>
          <option value="">{translator.t("survey.questions.livingLocationChoices.westernAreaRural")}</option>
          <option value="">{translator.t("survey.questions.livingLocationChoices.easternProvince")}</option>
          <option value="">{translator.t("survey.questions.livingLocationChoices.northernProvince")}</option>
          <option value="">{translator.t("survey.questions.livingLocationChoices.southernProvince")}</option>
          <option value="">{translator.t("survey.questions.livingLocationChoices.northWestProvince")}</option>
        </select>
      </div>

      <div className="space-y-4">
        <Typography size="2xl" weight="bold">
          {translator.t("survey.questions.maritalStatusTitleV1")}
        </Typography>
        <select
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="" disabled selected>{translator.t("select")}</option>
          <option value="">{translator.t("survey.questions.maritalStatusChoices.married")}</option>
          <option value="">{translator.t("survey.questions.maritalStatusChoices.widowed")}</option>
          <option value="">{translator.t("survey.questions.maritalStatusChoices.divorced")}</option>
          <option value="">{translator.t("survey.questions.maritalStatusChoices.separated")}</option>
          <option value="">{translator.t("survey.questions.maritalStatusChoices.neverMarried")}</option>
        </select>
      </div>

      <div className="space-y-4">
        <Typography size="2xl" weight="bold">
          {translator.t("survey.questions.hasDependentsTitleV1")}
        </Typography>
        <select
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="" disabled selected>{translator.t("select")}</option>
          <option value="">{translator.t("survey.questions.yesNoChoices.yes")}</option>
          <option value="">{translator.t("survey.questions.yesNoChoices.no")}</option>
        </select>
      </div>

      <div className="space-y-4">
        <Typography size="2xl" weight="bold">
          {translator.t("survey.questions.nrDependentsTitleV1")}
        </Typography>
        <select
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="" disabled selected>{translator.t("select")}</option>
          <option value="">{translator.t("survey.questions.nrDependentsChoices.1-2")}</option>
          <option value="">{translator.t("survey.questions.nrDependentsChoices.3-4")}</option>
          <option value="">{translator.t("survey.questions.nrDependentsChoices.5-7")}</option>
          <option value="">{translator.t("survey.questions.nrDependentsChoices.8-10")}</option>
          <option value="">{translator.t("survey.questions.nrDependentsChoices.10-")}</option>
        </select>
      </div>

      <div className="space-y-4">
        <Typography size="2xl" weight="bold">
          {translator.t("survey.questions.attendingSchoolV1")}
        </Typography>
        <select
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="" disabled selected>{translator.t("select")}</option>
          <option value="">{translator.t("survey.questions.yesNoChoices.yes")}</option>
          <option value="">{translator.t("survey.questions.yesNoChoices.no")}</option>
        </select>
      </div>

      <div className="space-y-4">
        <Typography size="2xl" weight="bold">
          {translator.t("survey.questions.employmentStatusTitleV1")}
        </Typography>
        <select
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="" disabled selected>{translator.t("select")}</option>
          <option value="">{translator.t("survey.questions.employmentStatusChoices.employed")}</option>
          <option value="">{translator.t("survey.questions.employmentStatusChoices.selfEmployed")}</option>
          <option value="">{translator.t("survey.questions.employmentStatusChoices.notEmployed")}</option>
          <option value="">{translator.t("survey.questions.employmentStatusChoices.retired")}</option>
        </select>
      </div>

      <div className="space-y-4">
        <Typography size="2xl" weight="bold">
          {translator.t("survey.questions.notEmployedTitleV1")}
        </Typography>
        <select
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="" disabled selected>{translator.t("select")}</option>
          <option value="">{translator.t("survey.questions.yesNoChoices.yes")}</option>
          <option value="">{translator.t("survey.questions.yesNoChoices.no")}</option>
        </select>
      </div>

      <div className="space-y-4">
        <Typography size="2xl" weight="bold">
          {translator.t("survey.questions.disabilityTitleV1")}
        </Typography>
        <select
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="" disabled selected>{translator.t("select")}</option>
          <option value="">{translator.t("survey.questions.yesNoChoices.yes")}</option>
          <option value="">{translator.t("survey.questions.yesNoChoices.no")}</option>
        </select>
      </div>

      <div className="space-y-4">
        <Typography size="2xl" weight="bold">
          {translator.t("survey.questions.skippingMealsTitleV1")}
        </Typography>
        <select
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="" disabled selected>{translator.t("select")}</option>
          <option value="">{translator.t("survey.questions.yesNoChoices.yes")}</option>
          <option value="">{translator.t("survey.questions.yesNoChoices.no")}</option>
        </select>
      </div>

      <div className="space-y-4">
        <Typography size="2xl" weight="bold">
          {translator.t("survey.questions.skippingMealsLastWeekTitleV1")}
        </Typography>
        <select
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="" disabled selected>{translator.t("select")}</option>
          <option value="">{translator.t("survey.questions.yesNoChoices.yes")}</option>
          <option value="">{translator.t("survey.questions.yesNoChoices.no")}</option>
        </select>
      </div>

      <div className="space-y-4">
        <Typography size="2xl" weight="bold">
          {translator.t("survey.questions.skippingMealsLastWeek3MealsTitleV1")}
        </Typography>
        <select
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="" disabled selected>{translator.t("select")}</option>
          <option value="">{translator.t("survey.questions.yesNoChoices.yes")}</option>
          <option value="">{translator.t("survey.questions.yesNoChoices.no")}</option>
        </select>
      </div>

      <div className="space-y-4">
        <Typography size="2xl" weight="bold">
          {translator.t("survey.questions.unexpectedExpensesCoveredTitleV1")}
        </Typography>
        <select
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="" disabled selected>{translator.t("select")}</option>
          <option value="">{translator.t("survey.questions.yesNoChoices.yes")}</option>
          <option value="">{translator.t("survey.questions.yesNoChoices.no")}</option>
        </select>
      </div>

      <div className="space-y-4">
        <Typography size="2xl" weight="bold">
          {translator.t("survey.questions.savingsTitleV1")}
        </Typography>
        <select
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="" disabled selected>{translator.t("select")}</option>
          <option value="">{translator.t("survey.questions.yesNoChoices.yes")}</option>
          <option value="">{translator.t("survey.questions.yesNoChoices.no")}</option>
        </select>
      </div>

      <div className="space-y-4">
        <Typography size="2xl" weight="bold">
          {translator.t("survey.questions.debtPersonalTitleV1")}
        </Typography>
        <select
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="" disabled selected>{translator.t("select")}</option>
          <option value="">{translator.t("survey.questions.yesNoChoices.yes")}</option>
          <option value="">{translator.t("survey.questions.yesNoChoices.no")}</option>
        </select>
      </div>

      <div className="space-y-4">
        <Typography size="2xl" weight="bold">
          {translator.t("survey.questions.debtPersonalRepayTitleV1")}
        </Typography>
        <select
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="" disabled selected>{translator.t("select")}</option>
          <option value="">{translator.t("survey.questions.yesNoChoices.yes")}</option>
          <option value="">{translator.t("survey.questions.yesNoChoices.no")}</option>
        </select>
      </div>

      <div className="space-y-4">
        <Typography size="2xl" weight="bold">
          {translator.t("survey.questions.debtHouseholdTitleV1")}
        </Typography>
        <select
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="" disabled selected>{translator.t("select")}</option>
          <option value="">{translator.t("survey.questions.yesNoChoices.yes")}</option>
          <option value="">{translator.t("survey.questions.yesNoChoices.no")}</option>
        </select>
      </div>

      <div className="space-y-4">
        <Typography size="2xl" weight="bold">
          {translator.t("survey.questions.debtHouseholdWhoRepaysTitleV1")}
        </Typography>
        <select
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="" disabled selected>{translator.t("select")}</option>
          <option value="">{translator.t("survey.questions.yesNoChoices.yes")}</option>
          <option value="">{translator.t("survey.questions.yesNoChoices.no")}</option>
        </select>
      </div>

      <div className="space-y-4">
        <Typography size="2xl" weight="bold">
          {translator.t("survey.questions.otherSupportTitleV1")}
        </Typography>
        <select
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="" disabled selected>{translator.t("select")}</option>
          <option value="">{translator.t("survey.questions.yesNoChoices.yes")}</option>
          <option value="">{translator.t("survey.questions.yesNoChoices.no")}</option>
        </select>
      </div>

      <div className="text-center pt-12">
        <button
          className="w-full p-4 bg-gray-400 text-white font-bold rounded cursor-not-allowed"
          disabled
        >
          {translator.t("save")}
        </button>
        <p className="mt-2 text-gray-600">
          {translator.t("demo")}
        </p>
      </div>

    </BaseContainer>
  );
}
