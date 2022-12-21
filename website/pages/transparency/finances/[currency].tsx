import { findFirst } from '@socialincome/shared/src/firebase/firestoreAdmin';
import { BankBalance, BANK_BALANCE_FIRESTORE_PATH } from '@socialincome/shared/src/types';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '../../../components/layout';
import { appConfig } from '../../../config';

interface Props {
	currency: string;
	balance: number;
}

export default function Finances({ currency, balance }: Props) {
	const { t } = useTranslation('website-finances');
	return (
		<Layout title={t('finances.title')}>
			<section>
				<p>{t('finances.mainText', { currency, balance })}</p>
			</section>
		</Layout>
	);
}

/**
 * Incrementally retrieve the stats from firestore.
 * getStaticProps are only executed at build time or incrementally on the server. It's therefore safe to
 * use the admin firestore directly.
 */
export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
	const currency = params?.currency as string;
	// TODO import proper transparency stats from firestore
	const exampleFirestoreDoc = await findFirst<BankBalance>(BANK_BALANCE_FIRESTORE_PATH, (query) => query);
	return {
		props: {
			...(await serverSideTranslations(locale!, ['website-finances'])),
			currency,
			balance: exampleFirestoreDoc?.data()?.balance,
		},
		revalidate: 60 * 2, // rebuild these pages every 2 minute on the server
	};
};

/**
 * Routes for all supported currencies
 */
export const getStaticPaths: GetStaticPaths = async ({ locales }) => {
	return {
		paths: appConfig.supportedCurrencies.flatMap((currency) => {
			return locales!.map((locale) => {
				return {
					params: {
						currency: currency.toLowerCase(),
					},
					locale: locale,
				};
			});
		}),
		fallback: false,
	};
};
