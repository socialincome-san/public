import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Typography } from '@socialincome/ui';
import { EmployersList } from './employers-list';

export default async function Page(props: DefaultPageProps) {
	const params = await props.params;
	const translator = await Translator.getInstance({ language: params.lang, namespaces: ['website-me'] });
	return (
		<div className="space-y-12">
			<Typography size="2xl" weight="medium" className="-mt-10 mb-4 md:mt-0">
				{translator.t('work-info.current-employer')}
			</Typography>
			<EmployersList
				lang={params.lang}
				region={params.region}
				translations={{
					addEmployerForm: {
						addEmployer: translator.t('work-info.add-employer'),
						submitButton: translator.t('work-info.submit-button'),
					},
					employersList: {
						emptyState: translator.t('work-info.empty-state'),
						deleteEmployer: translator.t('work-info.delete-employer'),
						pastEmployers: translator.t('work-info.past-employers'),
						noLongerWorkHere: translator.t('work-info.no-longer-work-here'),
					},
				}}
			/>
		</div>
	);
}
