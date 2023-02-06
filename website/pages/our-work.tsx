import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '../components/Layout';

export default function OurWork() {
	const { t } = useTranslation('website-our-work');
	return (
		<Layout title={t('ourWork.title')}>
			<section>
				<p></p>
			</section>
		</Layout>
	);
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
	return {
		props: {
			...(await serverSideTranslations(locale!, ['website-our-work'])),
		},
	};
};
