import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '../components/Layout';

export default function Faq() {
	const { t } = useTranslation('website-faq');
	return (
		<Layout title={t('faq.title')}>
			<section>
				<p></p>
			</section>
		</Layout>
	);
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
	return {
		props: {
			...(await serverSideTranslations(locale!, ['website-faq'])),
		},
	};
};
