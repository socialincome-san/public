import { DefaultPageProps } from '@/app/[lang]/[region]';
import { ContributionsTable } from '@/app/[lang]/[region]/(website)/me/payments/contributions-table';
import { Translator } from '@socialincome/shared/src/utils/i18n';

export default async function Page({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({ language: params.lang, namespaces: ['website-me'] });

	return (
		<div className="grid grid-cols-1 gap-4">
			<ContributionsTable
				translations={{
					date: translator.t('contributions.date'),
					amount: translator.t('contributions.amount'),
					source: translator.t('contributions.source'),
				}}
				{...params}
			/>
		</div>
	);
}
