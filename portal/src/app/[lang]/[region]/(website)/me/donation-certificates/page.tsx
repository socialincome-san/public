import { DefaultPageProps } from '@/app/[lang]/[region]';
import { DonationCertificatesTable } from '@/app/[lang]/[region]/(website)/me/donation-certificates/donation-certificates-table';
import { Translator } from '@socialincome/shared/src/utils/i18n';

export default async function Page(props: DefaultPageProps) {
	const params = await props.params;

	const { lang, region } = params;

	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-me'] });

	return (
		<div className="flex flex-col">
			<DonationCertificatesTable
				lang={lang}
				region={region}
				translations={{
					year: translator.t('donation-certificates.year'),
					downloadPDF: translator.t('donation-certificates.download-pdf'),
					noCertificatesYet: translator.t('donation-certificates.no-certificates-yet'),
				}}
			/>
		</div>
	);
}
