import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '../components/Layout';
import Link from "next/link";

export default function BankDetails() {
	const { t } = useTranslation('website-bank-details');
	return (
		<Layout title={t('website-bank-details.title')}>
			<section>
				<p>
					{t('website-bank-details.linkToFinances')}<br/>
					{t('website-bank-details.bankIntroText')}<br/>
					{t('website-bank-details.bankInfoTextRecurring')}<br/>
					{t('website-bank-details.bankOneTime')}<br/>
					{t('website-bank-details.bankPostFinance')}<br/>
					{t('website-bank-details.bankAccountHolder')}<br/>
					{t('website-bank-details.bankTxtIBAN1')}<br/>
					{t('website-bank-details.bankTxtIBAN2')}<br/>
					{t('website-bank-details.bankTxtBIC')}
				</p>
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
