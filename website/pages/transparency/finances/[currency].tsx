import { GetStaticPaths, GetStaticProps } from 'next';
import { NextRequest, NextResponse } from 'next/server';
import Layout from '../../../components/layout';
import { appConfig } from '../../../config';

interface Props {
	currency: string;
}

export default function Finances({ currency }: Props) {
	return (
		<Layout title={'Transparency Page'}>
			<section>
				<p>You are seeing the transparency page for {currency}</p>
			</section>
		</Layout>
	);
}

/**
 * Incrementally retrieve the stats from firestore
 */
export const getStaticProps: GetStaticProps = async (context) => {
	const currency = context.params?.currency as string;
	// TODO import transparency stats from firestore
	return {
		props: {
			currency,
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

/**
 * Forwards from /transparency/finances to /transparency/finances/[currency] according to the user's location.
 * This allows us to combine incremental static prebuilt pages and personalization based on user's location.
 * @param request
 */
export const financesMiddleware = (request: NextRequest) => {
	if (request.nextUrl.pathname.endsWith('/transparency/finances')) {
		// TODO add logic leveraging the request.geo.country information
		const redirectUrl = request.nextUrl.clone();
		redirectUrl.pathname = redirectUrl.pathname + '/chf';
		return NextResponse.redirect(redirectUrl);
	}
	return undefined;
};
