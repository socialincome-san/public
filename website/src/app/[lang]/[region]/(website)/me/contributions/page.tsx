import { DefaultPageProps } from '@/app/[lang]/[region]';
import { ContributionsTable } from '@/app/[lang]/[region]/(website)/me/contributions/contributions-table';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Button, linkCn } from '@socialincome/ui';
import Link from 'next/link';

export default async function Page(props: DefaultPageProps) {
	const params = await props.params;

	const { lang, region } = params;

	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-me'] });

	return (
		<div className="flex flex-col">
			<ContributionsTable
				lang={lang}
				region={region}
				translations={{
					date: translator.t('contributions.date'),
					amount: translator.t('contributions.amount'),
					source: translator.t('contributions.source'),
					status: translator.t('contributions.status-title'),
				}}
			/>
			<Link className={linkCn()} href={`/${lang}/${region}/donate/one-time`}>
				<Button Icon={PlusCircleIcon} variant="ghost" size="lg" className="w-full">
					{translator.t('contributions.one-time-payment')}
				</Button>
			</Link>
		</div>
	);
}
