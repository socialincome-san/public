import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import ApplePay from '../components/ApplePay';
import Layout from '../components/Layout';

export default function Home() {
	const { t } = useTranslation('website-index');
	return (
		<Layout title={t('index.title')}>
			<section>
				<p>{t('index.welcome')}</p>
				test
			</section>
			<section>
				<Link href="/transparency/finances">{t('index.linkToFinances')}</Link>
				<br />
				<Link href="/social-responsibility">{t('index.linkToSocialResponsibility')}</Link>
				<br />
				<br />
			</section>
			<section>
				<ApplePay />
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
