import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '../components/layout';

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
	return {
		props: {
			...(await serverSideTranslations(locale!, ['website-social-responsibility'])),
		},
	};
};
