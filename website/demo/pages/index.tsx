import { useRouter } from 'next/router';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { BuiltInFormatsDemo } from '../components/BuiltInFormatsDemo';
import { Header } from '../components/Header';
import { SwissContent } from '../components/SwissContent';

const Homepage = () => {
	const router = useRouter();

	return (
		<>
			<Header />
			<BuiltInFormatsDemo />
			{router.locale?.toLowerCase().endsWith('-ch') && <SwissContent />}
		</>
	);
};

export const getStaticProps = async ({ locale }: { locale: string }) => ({
	props: {
		...(await serverSideTranslations(locale)),
	},
});

export default Homepage;
