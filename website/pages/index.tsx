import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import Layout from '../components/layout';

export default function Home() {
	const { t } = useTranslation('website-index');
	return (
		<Layout title={t('index.title')}>
			<section>
				<p>{t('index.welcome')}</p>
			</section>
			<section>
				<Link href="/transparency/finances">{t('index.linkToFinances')}</Link>
			</section>
		</Layout>
	);
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
	return {
		props: {
			...(await serverSideTranslations(locale!, ['website-index'])),
		},
	};
};
