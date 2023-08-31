import { DefaultPageProps } from '@/app/[lang]/[country]';
import { ContributionsTable } from '@/app/[lang]/[country]/(website)/me/contributions/contributions-table';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BillingPortalButton } from './billing-portal-button';

export default async function Page({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({ language: params.lang, namespaces: ['website-me'] });

	return (
		<div className="flex flex-col space-y-4">
			<ContributionsTable
				translations={{ date: translator.t('contributions.date'), amount: translator.t('contributions.amount') }}
				{...params}
			/>
			<BillingPortalButton />
		</div>
	);
}
