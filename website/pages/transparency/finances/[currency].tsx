import Layout from '../../../components/layout';
import {GetStaticPaths, GetStaticProps} from "next";
import {appConfig} from "../../../config";

interface Props extends GetStaticProps {
    currency: string;
}

export default function Finances({currency}: Props) {
    return (
        <Layout title={"Transparency Page"}>
            <section>
                <p>You are seeing the transparency page for {currency}</p>
            </section>
        </Layout>
    );
}

export const getStaticProps: GetStaticProps = async (context) => {
    const currency = context.params?.currency as string
    // TODO import transparency stats from firestore
    return {
        props: {
            currency
        },
    }
}

export const getStaticPaths: GetStaticPaths = async () => {
    return {
        paths: appConfig.supportedCurrencies.map(currency => ({
            params: {
                currency: currency.toLowerCase()
            }
        })),
        fallback: false,
    }
}
