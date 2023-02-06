import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '../components/Layout';

export default function TheArts() {
	const { t } = useTranslation('website-the-arts');
	return (
		<Layout title={t('theArts.title')}>
			<section>
				<p></p>
			</section>
		</Layout>
	);
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
	return {
		props: {
			...(await serverSideTranslations(locale!, ['website-the-arts'])),
		},
	};
};
