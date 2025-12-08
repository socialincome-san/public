import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { getMetadata } from '@/metadata';
import { BaseContainer, Typography } from '@socialincome/ui';

export async function generateMetadata(props: DefaultPageProps) {
	const params = await props.params;
	return getMetadata(params.lang as WebsiteLanguage, 'website-survey');
}

export default async function Page(props: DefaultPageProps) {
	const params = await props.params;

	const { lang } = params;

	const translator = await Translator.getInstance({
		language: lang as WebsiteLanguage,
		namespaces: ['website-survey'],
	});

	return (
		<BaseContainer className="mx-auto flex max-w-2xl flex-col space-y-10 pb-16 pt-8">
			<Typography size="5xl" weight="bold">
				{translator.t('titleFollowup')}
			</Typography>

			<div className="space-y-4">
				<Typography size="2xl" weight="bold">
					{translator.t('survey.questions.financialIndependenceTitleV1')}
				</Typography>
				<select className="w-full rounded border border-gray-300 p-2">
					<option value="" disabled selected>
						{translator.t('select')}
					</option>
					<option value="">{translator.t('survey.questions.yesNoChoices.yes')}</option>
					<option value="">{translator.t('survey.questions.yesNoChoices.no')}</option>
				</select>
			</div>

			<div className="space-y-4">
				<Typography size="2xl" weight="bold">
					{translator.t('survey.questions.longEnoughTitleV1')}
				</Typography>
				<select className="w-full rounded border border-gray-300 p-2">
					<option value="" disabled selected>
						{translator.t('select')}
					</option>
					<option value="">{translator.t('survey.questions.yesNoChoices.yes')}</option>
					<option value="">{translator.t('survey.questions.yesNoChoices.no')}</option>
				</select>
			</div>

			<div className="space-y-4">
				<Typography size="2xl" weight="bold">
					{translator.t('survey.questions.livingLocationTitleV1')}
				</Typography>
				<select className="w-full rounded border border-gray-300 p-2">
					<option value="" disabled selected>
						{translator.t('select')}
					</option>
					<option value="">{translator.t('survey.questions.livingLocationChoices.westernAreaUrbanFreetown')}</option>
					<option value="">{translator.t('survey.questions.livingLocationChoices.westernAreaRural')}</option>
					<option value="">{translator.t('survey.questions.livingLocationChoices.easternProvince')}</option>
					<option value="">{translator.t('survey.questions.livingLocationChoices.northernProvince')}</option>
					<option value="">{translator.t('survey.questions.livingLocationChoices.southernProvince')}</option>
					<option value="">{translator.t('survey.questions.livingLocationChoices.northWestProvince')}</option>
				</select>
			</div>

			<div className="space-y-4">
				<Typography size="2xl" weight="bold">
					{translator.t('survey.questions.maritalStatusTitleV1')}
				</Typography>
				<select className="w-full rounded border border-gray-300 p-2">
					<option value="" disabled selected>
						{translator.t('select')}
					</option>
					<option value="">{translator.t('survey.questions.maritalStatusChoices.married')}</option>
					<option value="">{translator.t('survey.questions.maritalStatusChoices.widowed')}</option>
					<option value="">{translator.t('survey.questions.maritalStatusChoices.divorced')}</option>
					<option value="">{translator.t('survey.questions.maritalStatusChoices.separated')}</option>
					<option value="">{translator.t('survey.questions.maritalStatusChoices.neverMarried')}</option>
				</select>
			</div>

			<div className="space-y-4">
				<Typography size="2xl" weight="bold">
					{translator.t('survey.questions.hasDependentsTitleV1')}
				</Typography>
				<select className="w-full rounded border border-gray-300 p-2">
					<option value="" disabled selected>
						{translator.t('select')}
					</option>
					<option value="">{translator.t('survey.questions.yesNoChoices.yes')}</option>
					<option value="">{translator.t('survey.questions.yesNoChoices.no')}</option>
				</select>
			</div>

			<div className="space-y-4">
				<Typography size="2xl" weight="bold">
					{translator.t('survey.questions.nrDependentsTitleV1')}
				</Typography>
				<select className="w-full rounded border border-gray-300 p-2">
					<option value="" disabled selected>
						{translator.t('select')}
					</option>
					<option value="">{translator.t('survey.questions.nrDependentsChoices.1-2')}</option>
					<option value="">{translator.t('survey.questions.nrDependentsChoices.3-4')}</option>
					<option value="">{translator.t('survey.questions.nrDependentsChoices.5-7')}</option>
					<option value="">{translator.t('survey.questions.nrDependentsChoices.8-10')}</option>
					<option value="">{translator.t('survey.questions.nrDependentsChoices.10-')}</option>
				</select>
			</div>

			<div className="space-y-4">
				<Typography size="2xl" weight="bold">
					{translator.t('survey.questions.attendingSchoolV1')}
				</Typography>
				<select className="w-full rounded border border-gray-300 p-2">
					<option value="" disabled selected>
						{translator.t('select')}
					</option>
					<option value="">{translator.t('survey.questions.yesNoChoices.yes')}</option>
					<option value="">{translator.t('survey.questions.yesNoChoices.no')}</option>
				</select>
			</div>

			<div className="space-y-4">
				<Typography size="2xl" weight="bold">
					{translator.t('survey.questions.employmentStatusTitleV1')}
				</Typography>
				<select className="w-full rounded border border-gray-300 p-2">
					<option value="" disabled selected>
						{translator.t('select')}
					</option>
					<option value="">{translator.t('survey.questions.employmentStatusChoices.employed')}</option>
					<option value="">{translator.t('survey.questions.employmentStatusChoices.selfEmployed')}</option>
					<option value="">{translator.t('survey.questions.employmentStatusChoices.notEmployed')}</option>
					<option value="">{translator.t('survey.questions.employmentStatusChoices.retired')}</option>
				</select>
			</div>

			<div className="space-y-4">
				<Typography size="2xl" weight="bold">
					{translator.t('survey.questions.notEmployedTitleV1')}
				</Typography>
				<select className="w-full rounded border border-gray-300 p-2">
					<option value="" disabled selected>
						{translator.t('select')}
					</option>
					<option value="">{translator.t('survey.questions.yesNoChoices.yes')}</option>
					<option value="">{translator.t('survey.questions.yesNoChoices.no')}</option>
				</select>
			</div>

			<div className="space-y-4">
				<Typography size="2xl" weight="bold">
					{translator.t('survey.questions.disabilityTitleV1')}
				</Typography>
				<select className="w-full rounded border border-gray-300 p-2">
					<option value="" disabled selected>
						{translator.t('select')}
					</option>
					<option value="">{translator.t('survey.questions.yesNoChoices.yes')}</option>
					<option value="">{translator.t('survey.questions.yesNoChoices.no')}</option>
				</select>
			</div>

			<div className="space-y-4">
				<Typography size="2xl" weight="bold">
					{translator.t('survey.questions.skippingMealsTitleV1')}
				</Typography>
				<select className="w-full rounded border border-gray-300 p-2">
					<option value="" disabled selected>
						{translator.t('select')}
					</option>
					<option value="">{translator.t('survey.questions.yesNoChoices.yes')}</option>
					<option value="">{translator.t('survey.questions.yesNoChoices.no')}</option>
				</select>
			</div>

			<div className="space-y-4">
				<Typography size="2xl" weight="bold">
					{translator.t('survey.questions.skippingMealsLastWeekTitleV1')}
				</Typography>
				<select className="w-full rounded border border-gray-300 p-2">
					<option value="" disabled selected>
						{translator.t('select')}
					</option>
					<option value="">{translator.t('survey.questions.yesNoChoices.yes')}</option>
					<option value="">{translator.t('survey.questions.yesNoChoices.no')}</option>
				</select>
			</div>

			<div className="space-y-4">
				<Typography size="2xl" weight="bold">
					{translator.t('survey.questions.skippingMealsLastWeek3MealsTitleV1')}
				</Typography>
				<select className="w-full rounded border border-gray-300 p-2">
					<option value="" disabled selected>
						{translator.t('select')}
					</option>
					<option value="">{translator.t('survey.questions.yesNoChoices.yes')}</option>
					<option value="">{translator.t('survey.questions.yesNoChoices.no')}</option>
				</select>
			</div>

			<div className="space-y-4">
				<Typography size="2xl" weight="bold">
					{translator.t('survey.questions.unexpectedExpensesCoveredTitleV1')}
				</Typography>
				<select className="w-full rounded border border-gray-300 p-2">
					<option value="" disabled selected>
						{translator.t('select')}
					</option>
					<option value="">{translator.t('survey.questions.yesNoChoices.yes')}</option>
					<option value="">{translator.t('survey.questions.yesNoChoices.no')}</option>
				</select>
			</div>

			<div className="space-y-4">
				<Typography size="2xl" weight="bold">
					{translator.t('survey.questions.savingsTitleV1')}
				</Typography>
				<select className="w-full rounded border border-gray-300 p-2">
					<option value="" disabled selected>
						{translator.t('select')}
					</option>
					<option value="">{translator.t('survey.questions.yesNoChoices.yes')}</option>
					<option value="">{translator.t('survey.questions.yesNoChoices.no')}</option>
				</select>
			</div>
		</BaseContainer>
	);
}
