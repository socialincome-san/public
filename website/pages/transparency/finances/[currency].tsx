import { doc } from '@socialincome/shared/src/firebase/firestoreAdmin';
import { BankBalance, BANK_BALANCE_FIRESTORE_PATH } from '@socialincome/shared/src/types';
import { GetStaticPaths, GetStaticProps } from 'next';
import Layout from '../../../components/layout';
import { appConfig } from '../../../config';

interface Props {
	currency: string;
	balance: number;
}

export default function Finances({ currency, balance }: Props) {
	return (
		<Layout title={'Transparency Page'}>
			<section>
				<p>You are seeing the transparency page for {currency}</p>
				<p>Balance retrieved from firestore: {balance}</p>
			</section>
		</Layout>
	);
}

/**
 * Incrementally retrieve the stats from firestore.
 * getStaticProps are only executed at build time or incrementally on the server. It's therefore safe to
 * use the admin firestore directly.
 */
export const getStaticProps: GetStaticProps = async (context) => {
	const currency = context.params?.currency as string;
	// TODO import proper transparency stats from firestore
	const exampleFirestoreDoc = await doc<BankBalance>(BANK_BALANCE_FIRESTORE_PATH, 'main_1669470424').get();
	return {
		props: {
			currency,
			balance: exampleFirestoreDoc.data()?.balance,
		},
		revalidate: 60 * 2, // rebuild these pages every 2 minute on the server
	};
};

/**
 * Routes for all supported currencies
 */
export const getStaticPaths: GetStaticPaths = async () => {
	return {
		paths: appConfig.supportedCurrencies.map((currency) => ({
			params: {
				currency: currency.toLowerCase(),
			},
		})),
		fallback: false,
	};
};
