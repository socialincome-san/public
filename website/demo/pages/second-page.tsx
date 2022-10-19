import Link from 'next/link';

import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Header } from '../components/Header';

const SecondPage = () => {
	const { t } = useTranslation('second-page');

	return (
		<>
			<Header />
			<Link href="/">
				<button type="button">{t('back-to-home')}</button>
			</Link>
		</>
	);
};

export const getStaticProps = async ({ locale }: { locale: string }) => ({
	props: {
		...(await serverSideTranslations(locale, ['second-page'])),
	},
});

export default SecondPage;
