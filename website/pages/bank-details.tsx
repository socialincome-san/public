import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '../components/Layout';
import Link from 'next/link';

export default function BankDetails() {
	const { t } = useTranslation('website-bank-details');
	return (
		<Layout title={t('bankDetails.title')}>
			<section>
				<h4>{t('bankDetails.bankIntroText')}</h4>
				<h2>{t('bankDetails.bankInfoTextRecurring')}</h2>
				<p>
					{t('bankDetails.bankInfoTextRecurringComment')}
					<br />
					{t('bankDetails.bankPostFinance')}
					<br />
					{t('bankDetails.bankAccountHolder')}
					<br />
					{t('bankDetails.bankTxtIBAN')}&nbsp;{t('bankDetails.bankTxtIBAN1')}
					<br />
					{t('bankDetails.bankTxtBIC')}
					<br />
					<br />
				</p>
				<h2>{t('bankDetails.bankOneTime')}</h2>
				<p>
					{t('bankDetails.bankPostFinance')}
					<br />
					{t('bankDetails.bankAccountHolder')}
					<br />
					{t('bankDetails.bankTxtIBAN')}&nbsp;{t('bankDetails.bankTxtIBAN2')}
					<br />
					{t('bankDetails.bankTxtBIC')}
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
