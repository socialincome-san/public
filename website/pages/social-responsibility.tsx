import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '../components/Layout';
import DataList from '../../ui/datalist';
import firebase from '../../firebase';

export default function SocialResponsibility() {
	const { t } = useTranslation('website-social-responsibility');
	return (
		<Layout title={t('socialResponsibility.title')}>
			<section>
				<p>{t('socialResponsibility.text')}</p>
			</section>
		</Layout>
	);
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
	const dataRef = await db.collection('collectionName').get();
    const data = dataRef.docs.map(doc => doc.data());
	return {
		props: {
			data,
			...(await serverSideTranslations(locale!, ['website-social-responsibility'])),
		},
	};
};
