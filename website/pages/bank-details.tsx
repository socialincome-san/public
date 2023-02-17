import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '../components/Layout';

export default function BankDetails() {
	const { t } = useTranslation('website-bank-details');
	return (
		<Layout title={t('bankDetails.title')}>
			<section>
				<p></p>
			</section>
		</Layout>
	);
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
	return {
		props: {
			...(await serverSideTranslations(locale!, ['website-bank-details'])),
		},
	};
};
