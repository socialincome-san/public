import { DefaultPageProps } from '@/app/[lang]/[region]';
import { ContributionsTable } from '@/app/[lang]/[region]/(website)/me/contributions/contributions-table';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BillingPortalButton } from './billing-portal-button';

export default async function Page({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({ language: params.lang, namespaces: ['website-me'] });

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div className="flex max-w-lg flex-col space-y-4">
				<ContributionsTable
					translations={{ date: translator.t('contributions.date'), amount: translator.t('contributions.amount') }}
					{...params}
				/>
			</div>
			<BillingPortalButton />
		</div>
	);
}
